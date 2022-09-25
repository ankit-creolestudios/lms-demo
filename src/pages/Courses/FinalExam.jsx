import React, { Component } from 'react';
import apiCall from '../../helpers/apiCall';
import { QuestionsModal } from './QuestionsModal';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';
import { setExamReminder } from '../../store/actions/examActions';
import './FinalExam.scss';
import { CourseContext } from './CourseContext';

class FinalExam extends Component {
    static contextType = CourseContext;

    state = {
        current: {
            pausedAt: [],
            startedAt: [],
        },
        message: null,
        modalError: '',
        attemptToShow: null,
    };

    async componentDidMount() {
        if (!this.context.data.preExamUpdatedAt && !localStorage.getItem('isEnrollmentSubmittedNow')) {
            this.props.history.push(`/courses/${this.props.match.params.courseId}/preexam`);

            return;
        }
        await this.loadExamData();
        this.initSocketsEvents();
    }

    initSocketsEvents = () => {
        window.socket.on('exam started', (startedAt) => {
            this.setState({
                current: {
                    ...this.state.current,
                    startedAt,
                },
            });
            if (startedAt.length > 0) {
                this.props.setExamReminder(startedAt, this.state.current.timeLimit);
            }
            this.setLeaveWarning();
        });

        window.socket.on('exam submited', (response) => {
            if (response.success) {
                const status = response.data?.lastAttempts?.[0]?.status ?? response.data.status;
                this.props.setGlobalAlert({
                    type: status === 'FAIL' ? 'error' : 'success',
                    message: status === 'FAIL' ? 'You have failed your exam' : 'You have passed your exam',
                });

                this.redirectToPostExam();
            } else {
                this.setState({
                    modalError: response.message,
                });
            }
        });
    };

    redirectToPostExam = () => {
        localStorage.setItem('examCompleted', true);
        this.unsetLeaveWarning();
        this.props.setExamReminder(false);
        this.props.history.push(`/courses/${this.props.match.params.courseId}/postexam`);
    };

    loadExamData = async () => {
        const { success, response, message } = await apiCall('GET', `/users/exam/${this.props.match.params.courseId}`);

        if (success) {
            if (response?.current?.completedAt || response?.completedAt) {
                this.setState({
                    current: response,
                });

                if (response.status == 'SUCCESS') {
                    this.props.history.push(
                        `/courses/${response?.current?.userCourseId || response?.userCourseId}/postexam`
                    );
                }
            } else {
                this.handleAttempt(response.current?._id);

                this.setState({
                    ...response,
                });
            }
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Could not find course exam',
            });
        }
    };

    leaveWarningCallback(event) {
        const e = event || window.event;
        e.returnValue = '';

        e.preventDefault();
    }

    setLeaveWarning = () => {
        window.addEventListener('beforeunload', this.leaveWarningCallback);
    };

    unsetLeaveWarning = () => {
        window.removeEventListener('beforeunload', this.leaveWarningCallback);
    };

    checkAnswer = async (questionIndex, option) => {
        const { success, response } = await apiCall(
            'GET',
            `/users/exam/${this.state.current._id}/answer/${questionIndex}/${option}`
        );
        if (success) {
            let answers = this.state.current.answers;

            answers[questionIndex] = option;
            this.setState({
                marks: this.state.marks + response.marks,
                current: {
                    ...this.state.current,
                    answers,
                    spentTime: response.spentTime,
                },
            });
        }
    };

    handleAttempt = async (examId) => {
        if (this.state.current?.startedAt?.length === 0) {
            window.socket.emit('start exam', examId);
        }
    };

    handleSubmit = async () => {
        window.socket.emit('submit exam', {
            examId: this.state.current?._id,
            courseId: this.state.current?.userCourseId,
        });
    };

    render() {
        let { current } = this.state;

        return (
            <div className='exam-info'>
                <div>
                    <h4>
                        <b>Final Exam</b>
                    </h4>
                </div>
                {current && current?.startedAt?.length > current?.pausedAt?.length && (
                    <QuestionsModal
                        exam={true}
                        show={true}
                        title={current?.title}
                        questions={current?.questions}
                        answers={current?.answers}
                        error={this.state.modalError}
                        timeLimit={new Date().getTime() + (current.timeLimit - current.spentTime) * 60000}
                        allowSkip={current?.allowSkip}
                        onAnswer={this.checkAnswer}
                        onSubmit={this.handleSubmit}
                        onPause={this.handlePause}
                    />
                )}
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    const { examReminder } = state;
    return {
        examReminder,
    };
};

const mapDispatchToProps = {
    setExamReminder,
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(FinalExam));
