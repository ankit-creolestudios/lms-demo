import React, { Component, ReactNode } from 'react';
import { RouteComponentProps } from 'react-router';
import CourseContext from 'src/pages/Course/CourseContext';
import LessonContext from './LessonContext';
import { Api } from 'src/helpers/new';
import { PageLesson, SlideLesson } from './LessonTypes';
import { NavigationSidebar } from './NavigationSideBar';
import ProgressionManager from './ProgressionManager';
import { Spinner } from 'src/components/Spinner';
import './Lessons.scss';

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

interface IProps {}

type TProps = IProps & RouteComponentProps<IRouteProps>;

interface IFeedback {
    show: boolean;
    expanded: boolean;
}
interface IState {
    isLoading: boolean;
    lesson: any;
    feedback: IFeedback;
    pageStatus: string;
    isBlockedByNodes: boolean;
    cardsQuiz: Record<string, unknown>;
    hotspotsCardsViewedNodes: Record<string, unknown>;
}
export default class Lessons extends Component<TProps, IState> {
    static contextType = CourseContext;

    state: IState = {
        isLoading: true,
        pageStatus: 'LOADING',
        lesson: null,
        feedback: {
            show: false,
            expanded: false,
        },
        isBlockedByNodes: false,
        cardsQuiz: {},
        hotspotsCardsViewedNodes: {},
    };

    async componentDidMount() {
        const { lessonId } = this.props.match.params;
        if (lessonId) this.loadLessonData(lessonId);
    }

    async componentDidUpdate(prevProps: TProps) {
        if (prevProps.match.params.lessonId !== this.props.match.params.lessonId) {
            this.setState(
                {
                    pageStatus: 'LOADING',
                },
                async () => {
                    await this.loadLessonData(this.props.match.params.lessonId);
                }
            );
        }
    }

    componentWillUnmount() {
        // I wanted to have this inside the progression manager, however the unmounting during a lesson change caused issue with tracking left at
        window.socket.emit('leave-user-lesson', this.props.match.params.lessonId);
    }

    loadLessonData = async (lessonId: string) => {
        if (!this.state.isLoading) this.setState({ isLoading: true });
        // const { success, response } = await Api.call('get', `/users/lessons/${lessonId}`);

        // if (success) {
        //     this.setState({
        //         isLoading: false,
        //         lesson: response,
        //         hotspotsCardsViewedNodes: response?.hotspotsCardsViewedNodes ?? {},
        //     });
        // }

        const { success, response } = await Api.call('GET', `/users/lessons/${lessonId}`);
        let newState = null;

        if (success) {
            if (!('unlocked' in response)) {
                const { history: routerHistory } = this.props,
                    course = this.context.data;

                routerHistory.push(
                    `/courses/${course._id}/chapters/${course.lastChapterId}/lessons/${course.lastLessonId}`
                );
            }

            newState = {
                isLoading: false,
                lesson: {
                    ...response,
                },
                hotspotsCardsViewedNodes: response?.hotspotsCardsViewedNodes ?? {},
                pageStatus: 'READY',
            };
        }

        if (newState !== null) {
            this.setState(newState, async () => {
                const { unlockNextLesson, startedAt, completed } = this.state.lesson;
                if (!completed) {
                    if (unlockNextLesson === 'REQUIRED_TIME_MET') {
                        window.socket.emit('complete user lesson', this.props.match.params.lessonId);
                    }
                }
            });
        }
    };

    setFeedback = (feedback: IFeedback, cb: () => 1) => {
        this.setState(
            {
                feedback: {
                    ...this.state?.feedback,
                    ...feedback,
                },
            },
            cb
        );
    };

    setViewedNodes = (cardId: string, viewedNodes: any) => {
        this.setState({
            hotspotsCardsViewedNodes: {
                ...this.state.hotspotsCardsViewedNodes,
                [cardId]: viewedNodes,
            },
        });
    };

    setIsBlockedByNodes = (isBlockedByNodes: boolean) => {
        this.setState({
            isBlockedByNodes,
        });
    };

    setLessonCardQuestionAttempt = ({ cardIndex, questionAttempt }: any, cb: () => 1): void => {
        const lesson = { ...this.state.lesson };

        lesson.cards[cardIndex].questionAttempt = questionAttempt;

        this.setState(
            {
                lesson,
            },
            cb
        );
    };
    setCardsQuizState = (state: any, callback: () => 1) => {
        this.setState(
            {
                cardsQuiz: {
                    ...this.state.cardsQuiz,
                    ...state,
                },
            },
            callback
        );
    };

    public render(): ReactNode {
        const { pageStatus } = this.state;

        if (pageStatus === 'READY') {
            const { isLoading, lesson, feedback, isBlockedByNodes, cardsQuiz, hotspotsCardsViewedNodes } = this.state;
            const { course, examStatus } = this.context;
            return (
                <LessonContext.Provider
                    value={{
                        ...lesson,
                        isLoading,
                        lesson: lesson,
                        feedback,
                        isBlockedByNodes,
                        cardsQuiz,
                        hotspotsCardsViewedNodes,
                        setViewedNodes: this.setViewedNodes,
                        setIsBlockedByNodes: this.setIsBlockedByNodes,
                        setFeedback: this.setFeedback,
                        setLessonCardQuestionAttempt: this.setLessonCardQuestionAttempt,
                        setCardsQuizState: this.setCardsQuizState,
                        examStatus,
                    }}
                >
                    <div className='lesson-container'>
                        <ProgressionManager />
                        <NavigationSidebar course={course} />
                        {course.lessonType === 'page' && <PageLesson />}
                        {course.lessonType === 'slide' && <SlideLesson lesson={lesson} course={course} />}
                    </div>
                </LessonContext.Provider>
            );
        }
        return <Spinner />;
    }
}
