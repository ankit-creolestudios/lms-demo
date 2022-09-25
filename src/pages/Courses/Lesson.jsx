import React, { Component } from 'react';
import { LessonContext } from './LessonContext';
import { withRouter } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';
import { CardContainer, PageContainer } from './LessonContainers';
import { connect } from 'react-redux';
import { CourseContext } from './CourseContext';
import { Spinner } from '../../components/Spinner';
import './Lesson.scss';

class Lesson extends Component {
    static contextType = CourseContext;

    state = {
        chapter: null,
        lesson: null,
        feedback: {
            show: false,
            expanded: false,
        },
        pageStatus: 'LOADING',
        isBlockedByNodes: false,
        cardsQuiz: {},
    };

    setIsBlockedByNodes = (isBlockedByNodes) => {
        this.setState({
            isBlockedByNodes,
        });
    };

    setFeedback = (feedback, cb) => {
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

    async componentDidMount() {
        if ('lessonId' in this.props.match.params) {
            await this.loadLessonData(this.props.match.params.lessonId);
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if (
            (!('lessonId' in prevProps.match.params) && 'lessonId' in this.props.match.params) ||
            prevProps.match.params.lessonId !== this.props.match.params.lessonId
        ) {
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

    loadLessonData = async (lessonId) => {
        const { success, response } = await apiCall('GET', `/users/lessons/${lessonId}`);
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
                lesson: {
                    ...response,
                    countdownLimit:
                        response.unlockNextLesson === 'REQUIRED_TIME_MET' &&
                        response.requiredTime &&
                        !response.completed
                            ? new Date().getTime() + (response.requiredTime * 60 - response.currentTime) * 1000
                            : 0,
                },
                hotspotsCardsViewedNodes: response?.hotspotsCardsViewedNodes ?? {},
                pageStatus: 'READY',
            };

            if (response.userChapterId !== this.state.chapter?._id) {
                newState.chapter = await this.loadChapterData(response.userChapterId);
            }
        }

        if (newState !== null) {
            this.setState(newState, async () => {
                const { unlockNextLesson, startedAt, completed } = this.state.lesson;
                if (!completed) {
                    if (
                        (unlockNextLesson === 'ON_LESSON_START' && startedAt) ||
                        unlockNextLesson === 'ALWAYS_UNLOCKED'
                    ) {
                        await this.unlockNextLesson();
                    }

                    if (unlockNextLesson === 'REQUIRED_TIME_MET') {
                        window.socket.emit('complete user lesson', this.props.match.params.lessonId);
                    }
                }

                this.context.setLessonLayout(response.lessonLayout);

                if (window.innerWidth <= 900 && this.context.isMenuOpen) {
                    this.context.toggleIsMenuOpen();
                }
            });
        }
    };

    unlockNextLesson = async ({ showPopupErrors } = { showPopupErrors: true }) => {
        const { success, message } = await apiCall('POST', `/users/lessons/${this.state.lesson._id}/next`);

        if (success) {
            this.context.unlockLesson(this.state?.lesson?.nextLesson?._id);
            this.context.completeLesson(this.state.lesson._id);

            this.setState({
                lesson: {
                    ...this.state.lesson,
                    nextLesson: {
                        ...this.state.lesson.nextLesson,
                        unlocked: true,
                    },
                },
            });
        } else {
            if (showPopupErrors) {
                this.props.setGlobalAlert({ type: 'error', message });
            }
        }
    };

    enableNextButton = (callback = () => {}) => {
        this.setState(
            {
                lesson: {
                    ...this.state.lesson,
                    nextLesson: {
                        ...this.state.lesson.nextLesson,
                        unlocked: true,
                    },
                },
            },
            callback
        );
    };

    loadChapterData = async (chapterId) => {
        const { success, response } = await apiCall('GET', `/users/chapters/${chapterId}`);

        if (success) {
            return response;
        }
    };

    setLessonCardQuestionAttempt = ({ cardIndex, questionAttempt }, cb) => {
        const lesson = { ...this.state.lesson };

        lesson.cards[cardIndex].questionAttempt = questionAttempt;

        this.setState(
            {
                lesson,
            },
            cb
        );
    };

    setViewedNodes = (cardId, viewedNodes) => {
        this.setState({
            hotspotsCardsViewedNodes: {
                ...this.state.hotspotsCardsViewedNodes,
                [cardId]: viewedNodes,
            },
        });
    };

    setCardsQuizState = (state, callback) => {
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

    render() {
        const {
            state: { pageStatus },
        } = this;

        if (pageStatus === 'READY') {
            const { chapter, lesson, feedback, isBlockedByNodes, hotspotsCardsViewedNodes, cardsQuiz } = this.state,
                // LessonContainer = lesson.lessonLayout === 'PAGE' ? PageContainer : CardContainer,
                LessonContainer = CardContainer,
                contextValue = {
                    ...lesson,
                    feedback,
                    cardsQuiz,
                    isBlockedByNodes,
                    hotspotsCardsViewedNodes,
                    setViewedNodes: this.setViewedNodes,
                    setIsBlockedByNodes: this.setIsBlockedByNodes,
                    setFeedback: this.setFeedback,
                    unlockNextLessonFn: this.unlockNextLesson,
                    enableNextButton: this.enableNextButton,
                    setLessonCardQuestionAttempt: this.setLessonCardQuestionAttempt,
                    setCardsQuizState: this.setCardsQuizState,
                };

            return (
                <LessonContext.Provider value={contextValue}>
                    <LessonContainer lesson={contextValue} chapter={chapter} />
                </LessonContext.Provider>
            );
        }

        return <Spinner />;
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(Lesson));
