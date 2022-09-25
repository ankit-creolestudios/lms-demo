import React, { Component } from 'react';
import apiCall from '../../../../helpers/apiCall';
import { Api } from 'src/helpers/new';
import { Button, Modal } from 'react-bootstrap';
import { QuestionsModal } from '../../QuestionsModal';
import { withRouter } from 'react-router';
import LastAttempts from './LastAttempts';
import { LessonContext } from '../../LessonContext';
import shortEnglishHumanizer from '../../../../helpers/shortEnglishHumanizer';
import './EndOfChapterQuiz.scss';
import CardsQuiz from './CardsQuiz';

class EndOfChapterQuiz extends Component {
    static contextType = LessonContext;

    state = {
        lastAttempts: [],
        showLastAttempts: false,
        current: {
            pausedAt: [],
            startedAt: [],
        },
        showQuiz: false,
        message: null,
        modalError: '',
        attemptToShow: null,
        showAbandon: false,
        stickyLastAttempts: false,
    };

    async componentDidMount() {
        const { success, response, message } = await Api.call(
            'get',
            `users/lessons/${this.props.match.params.lessonId}/quiz`,
            null,
            {
                quizId: this.props.quizId ?? this.context.endOfChapterQuizId,
                cardId: this.props.cardId,
            }
        );

        if (success) {
            const passed = response.lastAttempts.findIndex((item) => item.status === 'SUCCESS') !== -1;

            this.setState({
                ...response,
                message:
                    response.lastAttempts[0] && passed
                        ? {
                              type: 'success',
                              text: `You can continue with the course or practice a little more.
                              To continue please click on the "NEXT" button.`,
                          }
                        : null,
                showQuiz:
                    (!!response.current?.startedAt?.length && !response.current?.pausedAt?.length) ||
                    (!!response.current?.startedAt?.length &&
                        response.current?.pausedAt?.length < response.current?.startedAt?.length),
            });
        }

        this.initSocketEvents();
    }

    initSocketEvents = () => {
        window.socket.on('quiz started', (startedAt) => {
            this.setState({
                current: {
                    ...this.state.current,
                    startedAt,
                },
                showQuiz: true,
                modalError: '',
            });

            if (this.context.unlockNextLesson === 'ON_QUIZ_START' && !this.context.nextLesson.unlocked) {
                this.context.unlockNextLessonFn();
            }

            this.setLeaveWarning();
        });

        window.socket.on('quiz paused', (pausedAt) => {
            this.setState({
                current: {
                    ...this.state.current,
                    pausedAt,
                },
                showQuiz: false,
            });

            this.unsetLeaveWarning();
        });

        window.socket.on('quiz resumed', (startedAt) => {
            this.setState({
                current: {
                    ...this.state.current,
                    startedAt,
                },
                modalError: '',
                showQuiz: true,
            });

            this.setLeaveWarning();
        });

        window.socket.on('quiz canceled', (response) => {
            this.setState(
                {
                    ...response.data,
                    showQuiz: true,
                },
                this.handleAttempt
            );
        });

        window.socket.on('quiz submited', async ({ success, data, message }) => {
            if (success) {
                const passed = data.lastAttempts[0].status === 'SUCCESS';

                this.setState({
                    ...data,
                    message: passed
                        ? {
                              type: 'success',
                              text: `You can continue with the course or practice a little more.
                                  To continue please click on the "NEXT" button.`,
                          }
                        : null,
                    showQuiz: false,
                });

                if (passed && this.context.unlockNextLesson === 'ON_QUIZ_PASS' && !this.context.completed) {
                    this.context.unlockNextLessonFn();
                }

                if (this.context.unlockNextLesson === 'ON_QUIZ_END' && !this.context.completed) {
                    this.context.unlockNextLessonFn();
                }

                this.unsetLeaveWarning();
            } else {
                this.setState({
                    modalError: message,
                });
            }
        });
    };

    leaveWarningCallback(event) {
        const e = event || window.event;

        e.returnValue = '';

        e.preventDefault();
    }

    showAbandonOptions = () => {
        this.setState({
            showAbandon: !this.state.showAbandon,
        });
    };

    setLeaveWarning = () => {
        window.addEventListener('beforeunload', this.leaveWarningCallback);
    };

    unsetLeaveWarning = () => {
        window.removeEventListener('beforeunload', this.leaveWarningCallback);
    };

    checkAnswer = async (questionIndex, option) => {
        const { success, response } = await apiCall(
            'GET',
            `/users/chapters/quiz/${this.state.current._id}/answer/${questionIndex}/${option}`
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

    handleCancel = async () => {
        window.socket.emit('cancel quiz', {
            userQuizId: this.state.current?._id,
            endOfChapterQuizId:
            this.props.quizId ?? this.context.endOfChapterQuizId,
            lessonId: this.props.match.params.lessonId,
        });
    };

    handlePause = async () => {
        window.socket.emit('pause quiz', this.state.current?._id);
    };

    handleResume = async () => {
        window.socket.emit('resume quiz', this.state.current?._id);
    };

    handleAttempt = async () => {
        window.socket.emit('start quiz', this.state.current?._id);
    };

    handleSubmit = async () => {
        window.socket.emit('submit quiz', {
            quizId: this.state.current?._id,
            lessonId: this.props.match.params.lessonId,
            endOfChapterQuizId: this.props.quizId ?? this.context.endOfChapterQuizId,
        });
    };

    hideLastAttempt = () => {
        this.setState({
            attemptToShow: null,
        });
    };

    setAttemptToShow = (attemptToShow) => {
        this.setState({
            attemptToShow,
        });
    };

    handleScroll = (e) => {
        if (e.target.scrollTop > 337) {
            this.setState({
                stickyLastAttempts: true,
            });
        } else {
            this.setState({
                stickyLastAttempts: false,
            });
        }
    };

    render() {
        let { current, lastAttempts, stickyLastAttempts } = this.state,
            { lessonLayout } = this.props;

        lastAttempts = !!current.pausedAt[0] ? [current, ...lastAttempts] : lastAttempts;

        return (
            <div
                className={`lesson-cards__endofchapter-quiz-type${
                    stickyLastAttempts ? ' lesson-cards__endofchapter-quiz-type--stickyLastAttempts' : ''
                }`}
                onScroll={this.handleScroll}
            >
                <div className='quiz__info'>
                    <h4>
                        <b>{current?.title ?? lastAttempts[0]?.title}</b>
                    </h4>
                    {this.state.message && (
                        <div className={`quiz__alert quiz__alert--${this.state.message.type}`}>
                            <h6>Passed</h6>
                            <span>{this.state.message.text}</span>
                        </div>
                    )}
                    <div className='quiz__footer'>
                        <div className='quiz__data'>
                            <p>
                                Number of questions: {current?.questions?.length ?? lastAttempts[0]?.questions?.length}
                            </p>
                            <p>Passing percentage: {current?.passPct ?? lastAttempts[0]?.passPct}%</p>
                            <p>
                                Time limit:&nbsp;
                                {shortEnglishHumanizer((current?.timeLimit ?? lastAttempts[0]?.timeLimit) * 60000)}
                            </p>
                        </div>
                        <Button
                            className='bp'
                            onClick={
                                !current.status &&
                                current.pausedAt.length === current.startedAt.length &&
                                current.startedAt.length !== 0
                                    ? this.showAbandonOptions
                                    : this.handleAttempt
                            }
                        >
                            Start new quiz
                        </Button>
                    </div>
                </div>
                {!!lastAttempts[0] && (
                    <LastAttempts
                        items={lastAttempts}
                        onResume={this.handleResume}
                        onItemClick={this.setAttemptToShow}
                    />
                )}
                {current &&
                    current?.startedAt?.length > current?.pausedAt?.length &&
                    (lessonLayout === 'card' ? (
                        <CardsQuiz
                            quizId={this.props.quizId ?? this.context.endOfChapterQuizId}
                            questions={current?.questions}
                            answers={current?.answers}
                            timeLimit={new Date().getTime() + (current.timeLimit - current.spentTime) * 60000}
                            allowSkip={current?.allowSkip}
                            onAnswer={this.checkAnswer}
                            onSubmit={this.handleSubmit}
                            onPause={this.handlePause}
                        />
                    ) : (
                        <QuestionsModal
                            show={this.state.showQuiz}
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
                    ))}
                {this.state.attemptToShow && (
                    <QuestionsModal
                        show={!!this.state.attemptToShow}
                        onHide={this.hideLastAttempt}
                        questions={this.state.attemptToShow?.questions}
                        title={this.state.attemptToShow?.title}
                        answers={this.state.attemptToShow?.answers}
                        attempt={this.state.attemptToShow}
                        readOnly={true}
                    />
                )}
                <Modal show={this.state.showAbandon} onHide={this.showAbandonOptions}>
                    <Modal.Body>Are you sure you want to abandon your previous attempt?</Modal.Body>
                    <Modal.Footer className='d-flex'>
                        <Button
                            className='bd mb-0'
                            onClick={() => {
                                this.handleCancel();
                                this.showAbandonOptions();
                            }}
                        >
                            Yes, start a new quiz
                        </Button>
                        <Button
                            className='bp ml-auto mb-0'
                            onClick={() => {
                                this.handleResume();
                                this.showAbandonOptions();
                            }}
                        >
                            No, resume previous attempt
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default withRouter(EndOfChapterQuiz);
