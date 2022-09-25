import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { Api, EventBus } from 'src/helpers/new';
import QuestionsModal from 'src/pages/Course/Stages/Lessons/Cards/Interactive/Quiz/Slide/QuestionsModal';
import CourseContext from 'src/pages/Course/CourseContext';
import './Exam.scss';

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

interface IProps {}
interface IState {
    current: {
        pausedAt: any;
        startedAt: any;
        _id?: string;
        answers?: any;
        spentTime?: any;
        userCourseId?: string;
        title: string;
        questions?: any;
        timeLimit?: any;
        allowSkip?: any;
    };
    message: string | null;
    modalError: string;
    attemptToShow: boolean | null;
    marks?: number;
}

type TProps = IProps & RouteComponentProps<IRouteProps>;

class Exam extends Component<TProps, IState> {
    static contextType = CourseContext;

    state: IState = {
        current: {
            pausedAt: [],
            title: '',
            startedAt: [],
        },
        message: null,
        modalError: '',
        attemptToShow: null,
    };

    async componentDidMount() {
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
            this.setLeaveWarning();
        });

        window.socket.on('exam submited', (response) => {
            if (response.success) {
                const status = response.data?.lastAttempts?.[0]?.status ?? response.data.status;
                EventBus.dispatch('toast', {
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
        this.unsetLeaveWarning();
        EventBus.dispatch('enter-post-exam');
    };

    loadExamData = async () => {
        const { success, response } = await Api.call('GET', `/users/exam/${this.props.match.params.courseId}`);
        if (success) {
            const examInProgress = !(response?.current?.completedAt || response?.completedAt);
            if (examInProgress) {
                this.handleAttempt(response.current?._id);

                this.setState({
                    ...response,
                });
            } else {
                this.setState({
                    current: response,
                });
            }
        }
    };

    leaveWarningCallback(event: any) {
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

    checkAnswer = async (questionIndex: number, option: any) => {
        const { success, response } = await Api.call(
            'GET',
            `/users/exam/${this.state.current._id}/answer/${questionIndex}/${option}`
        );
        if (success) {
            const answers = this.state.current.answers;

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

    handleAttempt = async (examId: string) => {
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
        const { current } = this.state;

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
                        title={current.title}
                        questions={current?.questions}
                        answers={current?.answers}
                        error={this.state.modalError}
                        timeLimit={new Date().getTime() + (current.timeLimit - current.spentTime) * 60000}
                        allowSkip={current?.allowSkip}
                        onAnswer={this.checkAnswer}
                        onSubmit={this.handleSubmit}
                    />
                )}
            </div>
        );
    }
}

export default withRouter(Exam);
