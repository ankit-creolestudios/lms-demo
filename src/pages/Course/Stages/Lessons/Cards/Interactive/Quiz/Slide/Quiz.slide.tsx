import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import apiCall from 'src/helpers/apiCall';
import { Api, EventBus } from 'src/helpers/new';
import { Button, Modal } from 'react-bootstrap';
// import { QuestionsModal } from '../../QuestionsModal';
import LastAttempts from './LastAttempts';
import LessonContext from '../../../../LessonContext';
import shortEnglishHumanizer from 'src/helpers/shortEnglishHumanizer';
import './Quiz.slide.scss';
import QuestionsModal from './QuestionsModal';
// import CardsQuiz from './CardsQuiz';
export interface IQuiz {
    _id: string;
    questions: any[];
    title: string;
    allowReattempt: string;
    revealAnswers: string;
}

export interface IProps {
    theme?: string;
    quizType?: string;
    quiz: IQuiz;
    cardId: string;
    quizAttempts: any[];
    quizPassed: boolean;
    lastAttempt: any;
    quizId?: string;
    cardIndex: number;
}

interface IRouteProps {
    lessonId: string;
}
interface IState {
    lastAttempts: any[];
    showLastAttempts: boolean;
    current: any;
    showQuiz: boolean;
    message: any | null;
    modalError: string;
    attemptToShow: any | null;
    showAbandon: boolean;
    stickyLastAttempts: boolean;
    marks: number;
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;
class EndOfChapterQuiz extends Component<TProps, IState> {
    static contextType = LessonContext;

    state: IState = {
        lastAttempts: [],
        showLastAttempts: false,
        current: {
            pausedAt: [],
            startedAt: [],
            _id: '',
            answers: [],
        },
        showQuiz: false,
        message: null,
        modalError: '',
        attemptToShow: null,
        showAbandon: false,
        stickyLastAttempts: false,
        marks: 0,
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
            const passed = response.lastAttempts.findIndex((item: any) => item.status === 'SUCCESS') !== -1;

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
    }

    showAbandonOptions = () => {
        this.setState({
            showAbandon: !this.state.showAbandon,
        });
    };

    checkAnswer = async (questionIndex: number, option: any) => {
        const { success, response } = await apiCall(
            'GET',
            `/users/chapters/quiz/${this.state.current._id}/answer/${questionIndex}/${option}`
        );

        if (success) {
            const answers = this.state.current.answers;
            1;

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
        EventBus.dispatch('cancel-quiz', { ...this.state, cardIndex: this.props.cardIndex });
    };

    handleResume = async () => {
        // window.socket.emit('resume quiz', this.state.current?._id);
        EventBus.dispatch('resume-quiz', { ...this.state, cardIndex: this.props.cardIndex });
    };

    handleAttempt = async () => {
        EventBus.dispatch('start-new-quiz', { ...this.state, cardIndex: this.props.cardIndex });
    };

    hideLastAttempt = () => {
        this.setState({
            attemptToShow: null,
        });
    };

    setAttemptToShow = (attemptToShow: any) => {
        this.setState({
            attemptToShow,
        });
    };

    handleScroll = (e: any) => {
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
        const { current, stickyLastAttempts } = this.state;
        let { lastAttempts } = this.state;

        //{ lessonLayout } = this.props;

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
                {/* {current &&
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
                    ))}*/}
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
