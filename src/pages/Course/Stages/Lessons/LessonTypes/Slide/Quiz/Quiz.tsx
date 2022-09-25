import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import LessonContext from '../../../LessonContext';
import LessonCard, { ICard } from '../../../Cards/LessonCard';
import { Spinner } from 'src/components/Spinner';
import { Api, EventBus } from 'src/helpers/new';
import Header from '../Header';
import Navigation from './QuizNavigation';
import CardsQuiz from './CardsQuiz';
import Feedback from '../Footer/Feedback';
import '../SlideContainer.scss';

interface IRouteProps {
    courseId: string;
    lessonId: string;
}
interface IProps {
    course: any;
    cardIndex: number;
    lesson: any;
    current: any;
    lastAttempt: any;
    eventType: string;
}
interface IState {
    activeQuestionCardIndex: number;
    blockingCardIndex: number | null;
    animationStatus: string | null;
    isComponentReady: boolean;
    lastAttempts: [];
    current: {
        pausedAt: any[];
        _id: string | null;
        startedAt: any[];
        questions: any[];
        answers: any[];
        timeLimit: any;
        spentTime: any;
        allowSkip: boolean;
    };
    showQuiz: boolean;
    message: null;
    modalError: '';
    attemptToShow: boolean | null;
    showAbandon: boolean;
    marks: number;
}
interface IChapter {
    _id: string;
    title: string;
}
type TProps = IProps & RouteComponentProps<IRouteProps>;

class Quiz extends Component<TProps, IState> {
    static contextType = LessonContext;
    state: IState = {
        activeQuestionCardIndex: 0,
        blockingCardIndex: -1,
        animationStatus: 'first_in',
        isComponentReady: false,
        lastAttempts: [],
        current: {
            ...this.props.current,
        },
        showQuiz: false,
        message: null,
        modalError: '',
        attemptToShow: null,
        showAbandon: false,
        marks: 0,
    };
    themeRef: any = React.createRef();

    async componentDidMount() {
        this.setState({
            current: {
                ...this.props.current,
            },
        });
        this.setDefaultActiveCardIndex(0);
        this.initSocketEvents();
        this.handleAttempt(this.props.eventType);
    }

    // async componentDidUpdate(prevProps: any, prevState: IState) {
    //     if (this.props.match.params.lessonId !== prevProps.match.params.lessonId) {
    //         this.setDefaultActiveCardIndex(0);
    //     }
    // }

    initSocketEvents = () => {
        window.socket.on('quiz started', (startedAt) => {
            console.log('startedAt', startedAt);
            this.setState({
                current: {
                    ...this.state.current,
                    startedAt,
                },
                showQuiz: true,
                modalError: '',
            });
            // if (this.context.unlockNextLesson === 'ON_QUIZ_START' && !this.context.nextLesson.unlocked) {
            //     this.context.unlockNextLessonFn();
            // }
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
            EventBus.dispatch('start-new-quiz', {
                isQuizCompleted: true,
                cardIndex: this.props.cardIndex,
            });
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
                () => {
                    this.handleAttempt('start-new-quiz');
                }
            );
        });

        window.socket.on('quiz submited', async ({ success, data, message }) => {
            if (success) {
                this.setState({
                    ...data,
                });

                this.unsetLeaveWarning();
                EventBus.dispatch('start-new-quiz', {
                    ...data,
                    isQuizCompleted: true,
                    cardIndex: this.props.cardIndex,
                });
            } else {
                this.setState({
                    modalError: message,
                });
            }
        });
    };

    setLeaveWarning = () => {
        window.addEventListener('beforeunload', this.leaveWarningCallback);
    };

    leaveWarningCallback(event: any) {
        const e = event || window.event;

        e.returnValue = '';

        e.preventDefault();
    }

    unsetLeaveWarning = () => {
        window.removeEventListener('beforeunload', this.leaveWarningCallback);
    };
    handleAttempt = async (type?: any) => {
        if (type === 'start-new-quiz') window.socket.emit('start quiz', this.state.current?._id);
        else if (type === 'resume-quiz') window.socket.emit('resume quiz', this.state.current?._id);
        else if (type === 'cancel-quiz') this.handleCancel();
    };

    handleResume = async () => {
        window.socket.emit('resume quiz', this.state.current?._id);
    };

    setDefaultActiveCardIndex = async (lastCardIndexOverride?: number) => {
        // const { cardIndex } = this.props.match.params;
        const activeQuestionCardIndex = 0;

        // if (
        //     this.props.course.lastCardIndex &&
        //     this.props.lesson?.previousLesson?._id !== this.props.course.lastLessonId
        // ) {
        //     activeCardIndex = lastCardIndexOverride ?? this.props.course.lastCardIndex;
        // }

        // if (cardIndex === 'last') {
        //     const { blockingCardIndex } = this.state;

        //     activeCardIndex =
        //         blockingCardIndex && blockingCardIndex !== -1 ? blockingCardIndex : this.props.lesson.cards.length - 1;
        // }

        this.setState({
            activeQuestionCardIndex,
        });
    };

    setActiveCardIndex = async (index: number) => {
        this.setState({
            activeQuestionCardIndex: index,
        });
    };

    checkAnswer = async (questionIndex: number, option: any) => {
        const { success, response } = await Api.call(
            'GET',
            `/users/chapters/quiz/${this.props.current._id}/answer/${questionIndex}/${option}`
        );

        if (success) {
            const answers = this.props.current.answers;

            answers[questionIndex] = option;

            this.setState({
                marks: this.state.marks + response.marks,
                current: {
                    ...this.props.current,
                    answers,
                    spentTime: response.spentTime,
                },
            });
        }
    };

    handlePause = async () => {
        window.socket.emit('pause quiz', this.props.current?._id);
    };

    handleSubmit = async () => {
        window.socket.emit('submit quiz', {
            quizId: this.props.current?._id,
            lessonId: this.props.match.params.lessonId,
            endOfChapterQuizId:
                this.context.lesson.cards[this.props.cardIndex].quizId ?? this.context.endOfChapterQuizId,
        });
    };
    handleCancel = async () => {
        window.socket.emit('cancel quiz', {
            userQuizId: this.state.current?._id,
            endOfChapterQuizId:
                this.context.lesson.cards[this.props.cardIndex].quizId ?? this.context.endOfChapterQuizId,
            lessonId: this.props.match.params.lessonId,
        });
    };

    render() {
        const { course, cardIndex } = this.props;
        const { isLoading, lesson, chapter } = this.context;
        if (isLoading) return <Spinner />;
        const { isComponentReady, activeQuestionCardIndex, blockingCardIndex, animationStatus } = this.state;
        const chapterName = chapter && chapter.length > 0 ? chapter[0]?.doc?.title : '';
        const progress = ((activeQuestionCardIndex + 1) * 100) / lesson.cards.length;
        const card = lesson.cards[cardIndex];
        const { cards } = lesson;
        const { theme = null, lessonLayout, cardsQuiz } = card;

        return (
            <div className={`slide-container slide-container--menu-collapsed`}>
                <div className='slide-container__wrapper'>
                    <Header
                        lessonName={this.context.lesson.title}
                        lessonType={this.context.lesson.lessonType}
                        chapterName={chapterName}
                        courseTitle={course.title}
                        lessonId={this.context.lesson._id}
                    />
                    <main
                        ref={this.themeRef}
                        className={`lesson-cards__theme-${theme || 'default'} ${
                            isComponentReady ? ' lesson-cards__ready' : ''
                        }'}`}
                    >
                        {/* <LessonCard
                            {...card}
                            key={card._id}
                            cardsQuiz={lesson.cardsQuiz}
                            cardIndex={activeCardIndex}
                            updateBlockingCardIndex={'false'}
                            lessonLayout='card'
                        />
                         */}

                        {/* <EndOfChapterQuiz
                            info={card.info}
                            cardIndex={card.cardIndex}
                            quizId={card.quizId}
                            lessonLayout={card.lessonLayout}
                            cardId={card._id}
                        /> */}
                        <div className='lesson-card'>
                            <CardsQuiz
                                quizId={card.quizId}
                                questions={this.state.current?.questions}
                                answers={this.state.current?.answers}
                                timeLimit={
                                    new Date().getTime() +
                                    (this.state.current.timeLimit - this.state.current.spentTime) * 60000
                                }
                                allowSkip={this.state.current?.allowSkip}
                                onAnswer={this.checkAnswer}
                                onSubmit={this.handleSubmit}
                                onPause={this.handlePause}
                                activeCardIndex={activeQuestionCardIndex}
                            />
                        </div>
                    </main>

                    <footer>
                        <Navigation
                            course={course}
                            activeCardIndex={activeQuestionCardIndex}
                            setActiveCardIndex={this.setActiveCardIndex}
                            blockingCardIndex={blockingCardIndex}
                            cardType={card.cardType}
                            questions={this.state.current?.questions}
                            handleSubmit={this.handleSubmit}
                        />
                        {/* <Feedback
                            course={course}
                            activeCardIndex={activeCardIndex}
                            setActiveCardIndex={this.setActiveCardIndex}
                        /> */}
                        <div className='slide-container__progress'>
                            <div style={{ width: `${progress}%` }}></div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}
export default withRouter(Quiz);
