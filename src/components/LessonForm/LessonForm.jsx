import './LessonForm.scoped.scss';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import apiCall from '../../helpers/apiCall';
import uuid from 'react-uuid';
import { Tab, Tabs, Modal } from 'react-bootstrap';
import { RouteLeavingGuard } from '../../components/RouteLeavingGuard';
import { Spinner } from '../../components/Spinner';
import LessonFormElement from './LessonFormElement';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { CourseNavigation } from '../../pages/Courses/Navigation';
import MenuItem from './MenuItem';
import PreviewLesson from './PreviewLesson';

class LessonForm extends Component {
    _isMounted = false;
    eventSource = null;

    state = {
        source: this.props.match.path.indexOf('courses') >= 0 ? 'courses' : 'core',
        type: this.props.match.path.indexOf('courses') >= 0 ? 'Course' : 'Core Library',
        lessonLoading: false,
        lessonCardsLoading: false,
        lastSavedTs: null,
        minsAgo: null,
        lesson: {},
        cardsPublished: [],
        cardsDraft: [],
        course: {},
        showPreview: false,
        canPublish: false,
    };

    createBreadcrumbs = () => {
        const { state, props } = this;
        this.props.pushBreadcrumbLink({
            text: state.source === 'core' ? 'Core Library' : 'Courses',
            path: `/admin/${state.source === 'core' ? 'core-library' : 'courses'}`,
        });

        this.props.pushBreadcrumbLink({
            text: `${state.type}: ${state.course.title}`,
            path: `/admin/${state.source === 'core' ? 'core-library/edit' : 'courses'}/${state.course._id}?focus=${
                state.lesson.chapterId
            }&highlight=${state.lesson._id}`,
        });

        this.props.pushBreadcrumbLink({
            text: `Lesson: ${state.lesson.title ? state.lesson.title : state.lesson.draft.title}`,
            path: this.props.match.url,
        });
    };

    togglePreview = () => {
        this.setState({
            showPreview: !this.state.showPreview,
        });
    };

    removeBreadcrumbs = (props, state) => {
        if (!state) {
            return;
        }

        this.props.removeBreadcrumbLink({
            text: state.source === 'core' ? 'Core Library' : 'Courses',
            path: `/admin/${state.source === 'core' ? 'core-library' : 'courses'}`,
        });

        this.props.removeBreadcrumbLink({
            text: `${state.type}: ${state?.course?.title}`,
            path: `/admin/${state.source === 'core' ? 'core-library/edit' : 'courses'}/${state.course._id}?focus=${
                state.lesson.chapterId
            }&highlight=${state.lesson._id}`,
        });

        this.props.removeBreadcrumbLink({
            text: `Lesson: ${state?.lesson?.title ? state?.lesson?.title : state?.lesson?.draft?.title}`,
            path: props.match.url,
        });
    };

    cancel = async () => {
        const { success } = await apiCall('POST', `/${this.state.source}/lessons/${this.props.match.params.id}/cancel`);

        if (success) {
            this.setState(
                {
                    canPublish: false,
                },
                this.loadThings
            );
        }
    };

    createButtons = () => {
        let customButtons = [
            {
                label: 'Save',
                onClick: this.handleSubmit,
                className: 'bp',
            },
            {
                label: 'Reset',
                onClick: this.cancel,
            },
            {
                label: 'Publish',
                onClick: () => {
                    this.handleSubmit(null, this.publish);
                },
            },
            {
                label: 'Preview',
                onClick: this.togglePreview,
            },
        ];

        if (this.state?.lesson?.previousLesson) {
            customButtons.push({
                label: 'Previous',
                className: 'lesson-navigation-btn',
                icon: faChevronLeft,
                link: `/admin/courses/${this.props.match.params.courseId}/chapters/${this.state.lesson.previousLesson.chapterId}/ext/lessons/edit/${this.state.lesson.previousLesson._id}`,
            });
        }

        if (this.state?.lesson?.nextLesson) {
            customButtons.push({
                label: 'Next',
                className: 'lesson-navigation-btn',
                icon: faChevronRight,
                link: `/admin/courses/${this.props.match.params.courseId}/chapters/${this.state.lesson.nextLesson.chapterId}/ext/lessons/edit/${this.state.lesson.nextLesson._id}`,
            });
        }

        this.props.createFormActions({
            customButtons,
        });
    };

    async componentDidMount() {
        await this.loadThings();
    }

    componentWillUnmount = async () => {
        this._isMounted = false;
        clearInterval(this.updateTimeInterval);
        clearInterval(this.saveInterval);
        this.removeBreadcrumbs(this.props, this.state);
        this.props.createFormActions({});
    };

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        const anyDirtyBefore = prevState.lesson.isDirty || prevState.cardsDraft.some((card) => card.isDirty),
            allCleanNow = !this.state.lesson.isDirty && this.state.cardsDraft.every((card) => !card.isDirty),
            anyDirtyNow = this.state.lesson.isDirty || this.state.cardsDraft.some((card) => card.isDirty),
            allCleanBefore = !prevState.lesson.isDirty && prevState.cardsDraft.every((card) => !card.isDirty);

        if (anyDirtyBefore && allCleanNow) {
            this.setState({
                lastSavedTs: Date.now(),
                minsAgo: 0,
                canPublish: true,
            });
            this.updateTimeInterval = setInterval(() => {
                this.setState({
                    minsAgo: Math.floor((Date.now() - this.state.lastSavedTs) / 1000 / 60),
                });
            }, 1000 * 60);
        }

        if (allCleanBefore && anyDirtyNow) {
            this.createButtons();
        }

        if (prevProps.match.params.id !== this.props.match.params.id) {
            this.removeBreadcrumbs(prevProps, prevState);
            this.loadThings();
        }

        if (!prevState.lesson && this.state.lesson) {
            this.createButtons();
        }
    };

    loadThings = async () => {
        this._isMounted = true;
        clearInterval(this.saveInterval);

        this.setState({
            lessonLoading: true,
            lessonCardsLoading: true,
        });

        try {
            const { success, response } = await apiCall(
                    'GET',
                    `/${this.state.source}/lessons/${this.props.match.params.id}`
                ),
                newState = {
                    lessonLoading: false,
                };

            if (success) {
                newState.lesson = { ...response };

                const courseUrl = `/${this.state.source}/${
                        newState.lesson.chapter[this.state.source == 'courses' ? 'courseId' : 'coreLibraryId']
                    }`,
                    { success: courseSuccess, response: course } = await apiCall('GET', courseUrl);

                if (courseSuccess) {
                    newState.course = course;
                }
            }

            this.setState(newState, this.createBreadcrumbs);
        } catch (e) {
            this.setState({
                lessonLoading: false,
            });
        }

        apiCall('GET', `/${this.state.source}/lessons/${this.props.match.params.id}/cards`)
            .then(({ success, response }) => {
                const newState = {
                    lessonCardsLoading: false,
                };
                if (this._isMounted && success) {
                    newState.cardsDraft = response.map((card, i) => {
                        card.uuid = card._id;

                        return card;
                    });
                    newState.cardsPublished = newState.cardsDraft.splice();
                }
                this.setState(newState);
            })
            .catch(() => {
                this.setState({
                    lessonCardsLoading: false,
                });
            });

        this.createButtons();
        // Temporarily disabled autosave
        // this.saveInterval = setInterval(() => {
        //     if (this.isAnythingDirty()) {
        //         this.handleSubmit();
        //     }
        // }, 1000 * 30);
    };

    handleFileChange = (card, type, url, file) => {
        this.handleCardChange(card, `${type}File`, file);
        this.handleCardChange(card, `source${type[0].toUpperCase() + type.substr(1).toLowerCase()}`, url);
    };

    handleChange = (event) => {
        if (this.state.lesson.draft[event.target.name] !== event.target.value) {
            this.setState({
                lesson: {
                    ...this.state.lesson,
                    draft: {
                        ...this.state.lesson.draft,
                        [event.target.name]: event.target.value,
                    },
                    isDirty: true,
                },
            });
        }
    };

    handleCardChange = (card, key, value) => {
        this.setState({
            cards: this.state.cardsDraft.map((thisCard) => {
                if (thisCard.uuid === card.uuid && thisCard.draft[key] !== value) {
                    thisCard.draft[key] = value;
                    thisCard.isDirty = true;
                }
                return thisCard;
            }),
        });
    };

    handleSubmit = async (event, callBack) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.state.lesson.isDirty && !this.state.lesson.submissionInProgress) {
            this.setState({
                lesson: {
                    ...this.state.lesson,
                    submissionInProgress: true,
                },
            });

            let lesson = {
                ...this.state.lesson.draft,
                chapterId: this.state.lesson.chapterId,
                menuIndex: this.state.lesson.menuIndex,
                unlockNextLesson: this.state.lesson.draft.unlockNextLesson,
            };

            delete lesson._id;
            delete lesson.isDirty;
            delete lesson.submissionInProgress;
            delete lesson.updatedAt;

            if ('conditionStatement' in lesson) {
                delete lesson.conditionStatement;
            }

            const { success, response, message } = await apiCall(
                'PUT',
                `/${this.state.source}/lessons/${this.props.match.params.id}`,
                lesson
            );

            if (this._isMounted && success) {
                this.removeBreadcrumbs(this.props, this.state);
                this.setState({
                    lesson: {
                        ...(response.data ? response.data : response),
                        isDirty: false,
                        submissionInProgress: false,
                    },
                });
                this.createBreadcrumbs();
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'There was a problem with saving this Lesson. Please try again',
                });
                this.setState({
                    lesson: {
                        ...this.state.lesson,
                        submissionInProgress: false,
                    },
                });
            }
        }

        const cardPromises = this.state.cardsDraft.map(async (card) => {
            if ((!card.isDirty && !card.isNew) || card.submissionInProgress) {
                return;
            }

            this.setState({
                cardsDraft: this.state.cardsDraft.map((thisCard) => {
                    if (card.uuid === thisCard.uuid) {
                        thisCard = {
                            ...thisCard,
                            submissionInProgress: true,
                        };
                    }
                    return thisCard;
                }),
            });

            const uploadPromises = ['image', 'audio', 'video', 'document'].map(async (type) => {
                if (card.draft && card.draft[`${type}File`]) {
                    let filePostData = new FormData();
                    filePostData.append('file', card.draft[`${type}File`]);
                    const { success, response } = await apiCall('POST', '/files', filePostData);

                    if (success && this._isMounted) {
                        card.draft[`source${type[0].toUpperCase() + type.substr(1).toLowerCase()}`] = response.fileId;

                        delete card.draft[`${type}File`];
                    }
                }
            });

            await Promise.all(uploadPromises);

            const method = card.isNew ? 'POST' : 'PUT',
                urlEnding = card.isNew ? `${this.state.lesson._id}/cards` : `cards/${card._id}`,
                url = `/${this.state.source}/lessons/${urlEnding}`,
                thisCardUuid = card.uuid;

            card = { ...card.draft };

            const { success, response, message } = await apiCall(method, url, card);

            if (this._isMounted && success && response && response._id) {
                this.setState({
                    cardsDraft: this.state.cardsDraft.map((thisCard) => {
                        if (thisCardUuid === thisCard.uuid) {
                            thisCard = {
                                ...response,
                                uuid: response._id,
                                submissionInProgress: false,
                            };
                        }
                        return thisCard;
                    }),
                    canPublish: true,
                });
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'There was a problem with saving this lesson. Please try again',
                });
                this.setState({
                    cardsDraft: this.state.cardsDraft.map((thisCard) => {
                        if (thisCardUuid === thisCard.uuid) {
                            thisCard = {
                                ...thisCard,
                                submissionInProgress: false,
                            };
                        }
                        return thisCard;
                    }),
                });
            }
        });

        await Promise.all(cardPromises);

        if (callBack && typeof callBack === 'function') {
            callBack();
        }
    };

    swapCards = (oldIdx, newIdx) => {
        let cards = [...this.state.cardsDraft];

        const [reorderedItem] = cards.splice(oldIdx, 1);
        cards.splice(newIdx, 0, reorderedItem);

        this.setState({
            cardsDraft: cards.map((card, i) => {
                if (card.draft.orderIndex !== i) {
                    card = {
                        ...{
                            ...card,
                            draft: {
                                ...card.draft,
                                orderIndex: i,
                            },
                        },
                        isDirty: true,
                    };
                }
                return card;
            }),
        });
    };

    handleDragAndDrop = (result) => {
        if (!result.destination || result.source.index === result.destination.index) {
            return;
        }
        this.swapCards(result.source.index, result.destination.index);
    };

    manualIdxChange = (newIdx, oldIdx) => {
        if (oldIdx === newIdx) {
            return;
        }
        this.swapCards(oldIdx, newIdx);
    };

    addNewCard = async (idx) => {
        idx = parseInt(idx) || 0;
        let cards = [...this.state.cardsDraft];
        cards.splice(idx, 0, await this.getEmptyCard());
        this.setState({
            cardsDraft: cards.map((card, i) => {
                if (card.draft && card.draft.orderIndex !== i) {
                    card.draft.orderIndex = i;
                    card.isDirty = true;
                }
                return card;
            }),
        });
    };

    getEmptyCard = async () => {
        const { success, response } = await apiCall(
            'GET',
            '/settings/values/default_heading_bgcolor,default_heading_textcolor'
        );

        return {
            uuid: uuid(),
            draft: {
                cardTitle: 'Card',
                cardType: 'TEXT',
                imageImportance: 'default',
                heading: '',
                subHeading: '',
                sourceImage: undefined,
                sourceVideo: undefined,
                sourceAudio: undefined,
                sourceDocument: undefined,
                bgColor: success ? response.default_heading_bgcolor : '#000000',
                fgColor: success ? response.default_heading_textcolor : '#FFFFFF',
                transcript: '',
                content: '',
                info: '',
                orderIndex: 0,
                question: '',
                quiz: {},
                answers: [
                    {
                        value: '',
                        correct: false,
                    },
                    {
                        value: '',
                        correct: false,
                    },
                    {
                        value: '',
                        correct: false,
                    },
                    {
                        value: '',
                        correct: false,
                    },
                ],
                requiresCorrectAnswer: false,
            },
            isNew: true,
            isDirty: true,
        };
    };

    deleteItem = async (idx) => {
        let cards = [...this.state.cardsDraft];
        const [deletedItem] = cards.splice(idx, 1);

        if (!deletedItem.isNew) {
            const { success, response, message } = await apiCall(
                'DELETE',
                `/${this.state.source}/lessons/cards/${deletedItem._id}`
            );

            if (this._isMounted && success && response) {
                this.setState({
                    cardsDraft: cards.map((card, i) => {
                        if (card.draft.orderIndex !== i) {
                            card = {
                                ...card,
                                draft: {
                                    ...card.draft,
                                    orderIndex: i,
                                },
                                isDirty: true,
                            };
                        }
                        return card;
                    }),
                });
                if (this.isAnythingDirty()) {
                    this.handleSubmit();
                }
                this.props.setGlobalAlert({
                    type: 'success',
                    message: message ?? 'Lesson Card was deleted',
                });
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'There was a problem with deleting the Card. Please try again',
                });
            }
        } else {
            this.setState({
                cardsDraft: cards.map((card, i) => {
                    return {
                        ...card,
                        draft: {
                            ...card.draft,
                            orderIndex: i,
                        },
                    };
                }),
            });
        }
    };

    isAnythingDirty = () => {
        return (
            this.state.lesson.isDirty ||
            this.state.cardsDraft.some((card) => card.isDirty) ||
            this.isAnythingDifferent()
        );
    };

    canPublish = () => {
        return this.state.canPublish || !this.isAnythingDirty();
    };

    isAnythingDifferent = () => {
        if (!this.state.lesson?.draft?.updatedAt) {
            return false;
        }

        return new Date(this.state.lesson.updatedAt).getTime() <= new Date(this.state.lesson.draft.updatedAt).getTime();
    };

    updateDraftUpdateTs = () => {
        this.setState(
            {
                lesson: {
                    ...this.state.lesson,
                    draft: {
                        ...this.state.lesson.draft,
                        updatedAt: new Date(),
                    },
                },
            },
            this.createButtons
        );
    };

    publish = async () => {
        if (this.eventSource === null) {
            if (this.isAnythingDirty()) {
                await this.handleSubmit();
            }
            this.setState({
                lessonLoading: true,
                lessonCardsLoading: true,
                canPublish: false,
            });

            this.eventSource = new EventSource(
                `${process.env.REACT_APP_API_URL}/${this.state.source}/lessons/${
                    this.props.match.params.id
                }/publish?token=${encodeURI(this.props.loggedIn.token)}`
            );

            this.eventSource.onmessage = (event) => {
                const eventData = JSON.parse(event.data);
                if (eventData.success) {
                    const { currentlyPublished, toPublish } = eventData.data;

                    if (toPublish === currentlyPublished) {
                        this.eventSource.close();
                        this.eventSource = null;
                        this.loadThings();
                        this.props.setGlobalAlert({
                            type: 'success',
                            message: 'Lesson has been published',
                        });
                    }
                } else {
                    this.props.setGlobalAlert({
                        type: 'error',
                        message: 'There was a problem with publishing this Lesson. Please try again.',
                    });
                }
            };

            this.eventSource.onerror = () => {
                this.eventSource.close();
                this.eventSource = null;

                this.setState({
                    lessonLoading: false,
                    lessonCardsLoading: false,
                });
                this.props.setGlobalAlert({
                    type: 'error',
                    message: 'There was a problem with publishing this Lesson. Please try again.',
                });
            };
        }
    };

    render() {
        if (this.state.lessonLoading) {
            return <Spinner />;
        }

        return (
            <div className='lesson-form'>
                <CourseNavigation
                    itemsEndpoint={`/courses/chapters/course/${this.props.match.params.courseId}/title`}
                    itemsComponent={MenuItem}
                />
                <div
                    style={{
                        display: 'inline-block',
                        width: '80%',
                        verticalAlign: 'top',
                    }}
                >
                    <RouteLeavingGuard
                        when={this.isAnythingDirty()}
                        navigate={(path) => this.props.history.push(path)}
                        shouldBlockNavigation={() => {
                            return this.isAnythingDirty();
                        }}
                    />
                    <Tabs>
                        <Tab eventKey='1' title='Draft' key='1'>
                            <LessonFormElement
                                editable={true}
                                togglePreview={this.togglePreview}
                                parent={this}
                                lesson={this.state.lesson.draft || {}}
                                cards={this.state.cardsDraft}
                                handleSubmit={this.handleSubmit}
                                updateDraftUpdateTs={this.updateDraftUpdateTs}
                            />
                        </Tab>
                        <Tab eventKey='2' title='Published' key='2'>
                            <LessonFormElement
                                editable={false}
                                parent={this}
                                published={this.state.lesson.title !== ''}
                                lesson={this.state.lesson}
                                cards={this.state.cardsPublished}
                            />
                        </Tab>
                    </Tabs>
                    <Modal
                        className='lesson-preview'
                        show={this.state.showPreview}
                        size='lg'
                        onHide={this.togglePreview}
                    >
                        <Modal.Body
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <PreviewLesson
                                cards={this.state.cardsDraft}
                                nextLessonId={this.state.lesson?.nextLesson?._id}
                                previousLessonId={this.state.lesson?.previousLesson?._id}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { loggedIn } = state;
    return {
        loggedIn,
    };
};

const mapDispatchToProps = {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
    createFormActions: (payload) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(LessonForm));
