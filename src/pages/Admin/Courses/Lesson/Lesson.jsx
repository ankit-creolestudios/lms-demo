import React, { Component } from 'react';
import { ComponentTabs } from '../../../../components/Tabs';
import LessonForm from './LessonForm';
import AdminLessonContext from './AdminLessonContext';
import apiCall from '../../../../helpers/apiCall';
import { withRouter, Prompt } from 'react-router-dom';
import { connect } from 'react-redux';
import { CourseNavigation } from '../../../Courses/Navigation';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import MenuItem from './MenuItem';
import './Lesson.scss';
import { faCheck, faSync } from '@fortawesome/free-solid-svg-icons';
import DraftPreview from './DraftPreview';
import PublishedPreview from './PublishedPreview';
import AdminCourseContext from '../AdminCourseContext';
import PreviewWrapper from './PreviewWrapper';

class Lesson extends Component {
    _isMounted = false;

    state = {
        lesson: {},
        lessonForm: {},
        chapter: {},
        course: {},
        cards: [],
        deletedCards: [],
        pageStatus: 'LOADING',
        currentlyPublished: 0,
        toPublish: 0,
        publishStatus: null,
        forcePublishedPreviewUpdate: false,
        isSaveDisabled: true,
        isSubmitDisabled: true,
        quizCards: [],
    };

    async componentDidMount() {
        this._isMounted = true;
        const { lessonId } = this.props.match.params;

        await this.loadLessonData(lessonId);
        this.addSocketEventsListeners();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.lessonId !== this.props.match.params.lessonId) {
            const { lessonId } = this.props.match.params;

            if (lessonId !== 'new') {
                if (prevProps.match.params.coreId) {
                    this.props.removeBreadcrumbLink({
                        text: 'Core Library',
                        path: `/admin/core-library`,
                    });
                    this.props.removeBreadcrumbLink({
                        text: `Core Library: ${this.state.chapter.title}`,
                        path: `/admin/core-library/edit/${prevProps.match.params.coreId}?focus=${prevProps.match.params.chapterId}&highlight=${prevProps.match.params.lessonId}`,
                    });
                    this.props.removeBreadcrumbLink({
                        text: `Lesson: ${this.state.lesson.title}`,
                        path: `/admin/core-library/${prevProps.match.params.coreId}/chapters/${prevProps.match.params.chapterId}/lessons/${prevProps.match.params.lessonId}`,
                    });
                } else {
                    this.props.removeBreadcrumbLink({
                        text: `Lesson: ${this.state.lesson.title}`,
                        path: `/admin/courses/${prevProps.match.params.courseId}/chapters/${prevProps.match.params.chapterId}/lessons/${prevProps.match.params.lessonId}`,
                    });
                }
                await this.loadLessonData(lessonId);
            }
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        if (this.props.match.params.coreId) {
            this.props.removeBreadcrumbLink({
                text: 'Core Library',
                path: `/admin/core-library`,
            });
            this.props.removeBreadcrumbLink({
                text: `Core Library: ${this.state.chapter.title}`,
                path: `/admin/core-library/edit/${this.props.match.params.coreId}?focus=${this.props.match.params.chapterId}&highlight=${this.props.match.params.lessonId}`,
            });
            this.props.removeBreadcrumbLink({
                text: `Lesson: ${this.state.lesson.title}`,
                path: `/admin/core-library/${this.props.match.params.coreId}/chapters/${this.props.match.params.chapterId}/lessons/${this.props.match.params.lessonId}`,
            });
        } else {
            this.props.removeBreadcrumbLink({
                text: `Lesson: ${this.state.lesson.title}`,
                path: `/admin/courses/${this.props.match.params.courseId}/chapters/${this.props.match.params.chapterId}/lessons/${this.props.match.params.lessonId}`,
            });
        }
    }

    updateDeletedCards = (deletedCards) => {
        this.setState({
            deletedCards,
        });
    };

    loadLessonData = async (lessonId) => {
        const { success, response, message } = await apiCall(
            'GET',
            this.props.match.params.coreId ? `/core/lessons/${lessonId}` : `/courses/lessons/${lessonId}`
        );

        if (this._isMounted) {
            if (success) {
                this.setState({
                    lesson: response,
                    lessonForm: {},
                    chapter: await this.loadChapterData(),
                    pageStatus: 'READY',
                    isSubmitDisabled: response?.updatedAt > response?.draft?.updatedAt,
                    isSaveDisabled: true,
                });
                if (this.props.match.params.coreId) {
                    this.props.pushBreadcrumbLink({
                        text: 'Core Library',
                        path: `/admin/core-library`,
                    });
                    this.props.pushBreadcrumbLink({
                        text: `Core Library: ${this.state.chapter.title}`,
                        path: `/admin/core-library/edit/${this.props.match.params.coreId}?focus=${this.props.match.params.chapterId}&highlight=${this.props.match.params.lessonId}`,
                    });
                    this.props.pushBreadcrumbLink({
                        text: `Lesson: ${response.title}`,
                        path: `/admin/core-library/${this.props.match.params.coreId}/chapters/${this.props.match.params.chapterId}/lessons/${this.props.match.params.lessonId}`,
                    });
                } else {
                    this.props.pushBreadcrumbLink({
                        text: `Lesson: ${response.title}`,
                        path: `/admin/courses/${this.props.match.params.courseId}/chapters/${this.props.match.params.chapterId}/lessons/${this.props.match.params.lessonId}`,
                    });
                }
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'Failed to load lesson data',
                });
            }
        }
    };

    loadChapterData = async () => {
        const { chapterId } = this.props.match.params,
            { success, response } = await apiCall(
                'GET',
                this.props.match.params.coreId
                    ? `/core/chapters/core/${this.props.match.params.coreId}`
                    : `/courses/chapters/${chapterId}`
            );

        if (success) {
            if (this.props.match.params.coreId) {
                let newObj = response.chapters.find((chap) => chap._id === this.props.match.params.chapterId);
                delete newObj.lessons;
                return newObj;
            } else {
                return response;
            }
        } else {
            return {};
        }
    };

    addSocketEventsListeners = () => {
        window.socket.on('publishing course lesson', ({ currentlyPublished, toPublish }) => {
            this.setState({
                currentlyPublished,
                toPublish,
                publishStatus: 'PUBLISHING',
            });
        });

        window.socket.on('published course lesson', () => {
            this.setState(
                {
                    publishStatus: 'PUBLISHED',
                    isPublishDisabled: true,
                },
                () => {
                    this.disablePublishButton();
                    setTimeout(() => {
                        this.setState({
                            publishStatus: null,
                            forcePublishedPreviewUpdate: true,
                        });
                    }, 1500);
                }
            );
        });

        // Fore Core Lesson

        window.socket.on('publishing core lesson', ({ currentlyPublished, toPublish }) => {
            this.setState({
                currentlyPublished,
                toPublish,
                publishStatus: 'PUBLISHING',
            });
        });

        window.socket.on('published core lesson', () => {
            this.setState(
                {
                    publishStatus: 'PUBLISHED',
                    isPublishDisabled: true,
                },
                () => {
                    this.disablePublishButton();
                    setTimeout(() => {
                        this.setState({
                            publishStatus: null,
                            forcePublishedPreviewUpdate: true,
                        });
                    }, 1500);
                }
            );
        });
    };

    handleLessonChange = (type, data, callback) => {
        if (type === 'card') {
            const cards = [...this.state.cards];

            if (data.setHotspots !== undefined) {
                delete data.setHotspots;
            }

            cards[data.orderIndex] = data;

            this.setState({ cards }, callback);
        }
    };

    patchLessonCard = (orderIndex, data, callback) => {
        const cards = [...this.state.cards],
            currentData = cards[orderIndex];

        cards[orderIndex] = {
            ...currentData,
            ...data,
        };

        this.setState({ cards }, callback);
    };

    updateCards = (cards, callback) => {
        this.setState({ cards }, callback);
    };

    updateLessonForm = (data, callback) => {
        this.setState(
            {
                lessonForm: {
                    ...this.state.lessonForm,
                    ...data,
                },
            },
            callback
        );
    };

    enableSaveButton = (callback) => {
        if (this.state.isSaveDisabled !== false) {
            this.setState(
                {
                    isSaveDisabled: false,
                },
                callback
            );
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    disableSaveButton = (callback) => {
        if (this.state.isSaveDisabled !== true) {
            this.setState(
                {
                    isSaveDisabled: true,
                },
                callback
            );
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    enablePublishButton = (callback) => {
        if (this.state.isSubmitDisabled !== false) {
            this.setState(
                {
                    isSubmitDisabled: false,
                },
                callback
            );
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    disablePublishButton = (callback) => {
        if (this.state.isSubmitDisabled !== true) {
            this.setState(
                {
                    isSubmitDisabled: true,
                },
                callback
            );
        } else {
            if (typeof callback === 'function') {
                callback();
            }
        }
    };

    setLessonId = (lessonId, callback) => {
        this.setState(
            {
                lesson: {
                    _id: lessonId,
                },
            },
            callback
        );
    };

    setForcePublishedPreviewUpdate = () => {
        this.setState({
            forcePublishedPreviewUpdate: false,
        });
    };

    handleAddAllQuizCards = (allQuizes) => {
        this.setState({
            quizCards: allQuizes.map((data) => ({ ...data, ...data.draft })),
        });
    };

    handleQuizCards = (orderIndex, data) => {
        const cards = [...this.state.cards],
            currentData = cards[orderIndex];

        const quizIndex = this.state.quizCards.findIndex((card) => card._id === currentData?._id);

        if (quizIndex === -1) {
            this.setState({
                quizCards: [
                    ...this.state.quizCards,
                    {
                        ...currentData,
                        ...data,
                    },
                ],
            });
        } else {
            const newQuizCards = [...this.state.quizCards];
            newQuizCards.splice(quizIndex, 1);
            this.setState({
                quizCards: newQuizCards,
            });
        }
    };

    handleAddQuizToCard = (cardId, quizData) => {
        const allQuizData = [...this.state.quizCards];
        const quizCardIndex = this.state.quizCards.findIndex((card) => card?._id === cardId);
        if (quizCardIndex !== -1) {
            const quizCardData = this.state.quizCards[quizCardIndex];
            quizCardData.quiz = {
                ...quizData,
            };
            allQuizData.splice(quizCardIndex, 1, quizCardData);
            this.setState({
                quizCards: allQuizData,
            });
        }
    };

    handleUpdateQuizCard = (cardId, orderIndex) => {
        const cards = [...this.state.cards],
            currentDataId = cards[orderIndex]?._id,
            newQuizData = this.state.quizCards,
            quizDataIndex = newQuizData.findIndex((data) => data?._id === currentDataId);

        newQuizData.splice(quizDataIndex, 1, {
            ...newQuizData[quizDataIndex],
            _id: cardId,
        });
        this.setState({
            quizCards: [...newQuizData],
        });
    };

    render() {
        const {
            lesson,
            lessonForm,
            chapter,
            course,
            cards,
            pageStatus,
            currentlyPublished,
            toPublish,
            publishStatus,
            forcePublishedPreviewUpdate,
            deletedCards,
            isSaveDisabled,
            isSubmitDisabled,
            quizCards,
        } = this.state;

        return (
            <>
                <Prompt
                    when={!this.state.isSaveDisabled}
                    message={(location) => `Page has unsaved changes. Are you sure you want to go to leave?`}
                />
                <AdminLessonContext.Provider
                    value={{
                        lesson,
                        lessonForm,
                        chapter,
                        course,
                        cards,
                        deletedCards,
                        pageStatus,
                        isSaveDisabled,
                        isSubmitDisabled,
                        quizCards,
                        cardsQuiz: {},
                        setGlobalAlert: this.props.setGlobalAlert,
                        handleLessonChange: this.handleLessonChange,
                        patchLessonCard: this.patchLessonCard,
                        updateDeletedCards: this.updateDeletedCards,
                        updateCards: this.updateCards,
                        updateLessonForm: this.updateLessonForm,
                        enableSaveButton: this.enableSaveButton,
                        enablePublishButton: this.enablePublishButton,
                        disableSaveButton: this.disableSaveButton,
                        disablePublishButton: this.disablePublishButton,
                        setLessonId: this.setLessonId,
                        lessonLayout: 'PAGE',
                        handleQuizCards: this.handleQuizCards,
                        handleAddQuizToCard: this.handleAddQuizToCard,
                        handleAddAllQuizCards: this.handleAddAllQuizCards,
                        handleUpdateQuizCard: this.handleUpdateQuizCard,
                    }}
                >
                    <div className='admin-lesson'>
                        <CourseNavigation
                            itemsEndpoint={
                                this.props.match.params.coreId
                                    ? `/core/chapters/core/${this.props.match.params.coreId}/title`
                                    : `/courses/chapters/course/${this.props.match.params.courseId}/title`
                            }
                            itemsComponent={MenuItem}
                        />
                        <main>
                            {!!publishStatus && (
                                <span className='message-alert positive narrow'>
                                    {publishStatus === 'PUBLISHING' ? <Fa icon={faSync} spin /> : <Fa icon={faCheck} />}
                                    {publishStatus === 'PUBLISHING' ? 'Publishing' : 'Published'} {currentlyPublished}
                                    &nbsp; of &nbsp;{toPublish} lesson cards
                                </span>
                            )}
                            <AdminLessonContext.Consumer>
                                {(lessonContext) => (
                                    <AdminCourseContext.Consumer>
                                        {(courseContext) => (
                                            <ComponentTabs>
                                                <LessonForm tabTitle='Edit' adminLessonContext={lessonContext} />
                                                {/* <PreviewWrapper tabTitle='Preview'>
                                                    <DraftPreview
                                                        course={courseContext}
                                                        chapter={lessonContext.chapter}
                                                        lesson={{
                                                            ...lessonContext.lesson,
                                                            ...lessonContext.lessonForm,
                                                        }}
                                                        cards={lessonContext.cards}
                                                        currentLessonId={lesson?._id}
                                                    />
                                                </PreviewWrapper>
                                                <PreviewWrapper tabTitle='Published'>
                                                    <PublishedPreview
                                                        course={courseContext}
                                                        chapter={lessonContext.chapter}
                                                        forcePublishedPreviewUpdate={forcePublishedPreviewUpdate}
                                                        setForcePublishedPreviewUpdate={
                                                            this.setForcePublishedPreviewUpdate
                                                        }
                                                        currentLessonId={lesson?._id}
                                                    />
                                                </PreviewWrapper> */}
                                            </ComponentTabs>
                                        )}
                                    </AdminCourseContext.Consumer>
                                )}
                            </AdminLessonContext.Consumer>
                        </main>
                    </div>
                </AdminLessonContext.Provider>
            </>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(Lesson));
