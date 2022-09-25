import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { LastAttempts } from '../../Courses/CardTypes/EndOfChapterQuiz';
import apiCall from '../../../helpers/apiCall';
import { QuestionsModal } from '../../Courses/QuestionsModal';
import { connect } from 'react-redux';

class CourseProgressAssessment extends Component {
    state = {
        lastAttempts: [],
        attemptToShow: null,
        showAttempts: false,
    };

    setAttemptToShow = (attemptToShow) => {
        this.setState({
            attemptToShow,
        });
    };

    hideLastAttempt = () => {
        this.setState({
            attemptToShow: null,
        });
    };

    loadAttempts = async () => {
        const { success, response, message } = await apiCall('GET', `/users/lessons/${this.props.lessonId}/quiz`);

        if (success) {
            this.setState({
                lastAttempts: response.lastAttempts,
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Failed to load user quiz attempts',
            });
        }
    };

    toggleShowAttempts = async () => {
        if (!this.state.lastAttempts[0]) {
            await this.loadAttempts();
        }

        this.setState({
            showAttempts: !this.state.showAttempts,
        });
    };

    render() {
        const { lastAttempts, attemptToShow, showAttempts } = this.state;

        return (
            <>
                <Button size='sm' className={this.props.buttonClassName} onClick={this.toggleShowAttempts}>
                    Attempts
                </Button>
                <Modal
                    size='lg'
                    show={showAttempts}
                    className='course-progress__last-attempts'
                    onHide={this.toggleShowAttempts}>
                    <Modal.Header closeButton>
                        <h3>User past attempts</h3>
                    </Modal.Header>
                    <Modal.Body>
                        {!!lastAttempts[0] ? (
                            <div className='last-attempts'>
                                <LastAttempts items={lastAttempts} onItemClick={this.setAttemptToShow} />
                            </div>
                        ) : (
                            'User did not attempt to take the quiz yet'
                        )}
                    </Modal.Body>
                </Modal>
                {attemptToShow && (
                    <QuestionsModal
                        show={!!attemptToShow}
                        onHide={this.hideLastAttempt}
                        questions={attemptToShow?.questions}
                        title={attemptToShow?.title}
                        answers={attemptToShow?.answers}
                        attempt={attemptToShow}
                        readOnly={true}
                    />
                )}
            </>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(CourseProgressAssessment);
