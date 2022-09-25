import React, { Component } from 'react';
import { Spinner } from '../../../../components/Spinner';
import LessonFormInputs from './LessonFormInputs';
import LessonCards from './LessonCards';
import { connect } from 'react-redux';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { withRouter } from 'react-router-dom';
import apiCall from '../../../../helpers/apiCall';
import { Modal } from 'react-bootstrap';

class LessonForm extends Component {
    state = {
        showRevertModal: false,
    };

    componentDidMount() {
        this.setPageButtons();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            this.props.adminLessonContext?.lesson?._id !== prevProps.adminLessonContext?.lesson?._id ||
            this.props.adminLessonContext?.isSaveDisabled !== prevProps.adminLessonContext?.isSaveDisabled ||
            this.props.adminLessonContext?.isSubmitDisabled !== prevProps.adminLessonContext?.isSubmitDisabled
        ) {
            this.setPageButtons();
        }
    }

    componentWillUnmount = () => {
        this.props.setFormActions({
            customButtons: [],
        });
    };

    setPageButtons = () => {
        const {
                props: { adminLessonContext },
            } = this,
            { isSaveDisabled, isSubmitDisabled } = adminLessonContext;

        const customButtons = [
            {
                label: 'Save',
                onClick: this.handleSubmit,
                className: 'bp',
                disabled: isSaveDisabled,
            },
            {
                label: 'Publish',
                onClick: this.handlePublish,
                className: isSubmitDisabled ? '' : 'bp',
                disabled: isSubmitDisabled,
            },
            {
                label: 'Revert',
                onClick: this.handleShowRevertWarningModal,
                disabled: isSubmitDisabled,
            },
        ];

        if (adminLessonContext?.lesson?.previousLesson) {
            customButtons.push({
                label: 'Previous',
                className: 'lesson-navigation-btn',
                icon: faChevronLeft,
                link: `/admin/courses/${this.props.match.params.courseId}/chapters/${adminLessonContext.lesson.previousLesson.chapterId}/lessons/${adminLessonContext.lesson.previousLesson._id}`,
            });
        }

        if (adminLessonContext?.lesson?.nextLesson) {
            customButtons.push({
                label: 'Next',
                className: 'lesson-navigation-btn',
                icon: faChevronRight,
                link: `/admin/courses/${this.props.match.params.courseId}/chapters/${adminLessonContext.lesson.nextLesson.chapterId}/lessons/${adminLessonContext.lesson.nextLesson._id}`,
            });
        }

        this.props.setFormActions({
            customButtons,
        });
    };

    handleShowRevertWarningModal = async () => {
        this.setState({ showRevertModal: !this.state.showRevertModal });
    };

    handleSubmit = async () => {
        this.props.adminLessonContext.disableSaveButton();
        await this.handleSubmitLessonCards();
        await this.handleDeletedLessonCards();
        await this.handleSubmitLessonForm();
    };

    handleSubmitLessonForm = async () => {
        const {
            lesson: { _id: lessonId, chapterId },
            lessonForm: { hasQuiz, currentLessonId, ...values },
        } = this.props.adminLessonContext;

        const { success, message } = await apiCall(
            'PUT',
            `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/${lessonId}`,
            {
                ...values,
                chapterId: chapterId,
            }
        );

        if (success) {
            this.props.adminLessonContext.enablePublishButton(() => {
                this.props.setGlobalAlert({
                    type: 'success',
                    message: message ?? 'Lesson draft saved',
                });
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: `Lesson draft could not be saved: ${message}`,
            });
            this.props.adminLessonContext.enableSaveButton();
        }
    };

    handleSubmitLessonCards = async () => {
        const { cards } = this.props.adminLessonContext;

        for (const cardIndex in cards) {
            await this.submitLessonCard(cards[cardIndex], parseInt(cardIndex));
        }
    };

    submitLessonCard = async (card, orderIndex) => {
        let payload = { ...card, orderIndex };
        const isNew = card?._id?.includes('-') ?? true;

        if (payload.cardType === 'QUIZ') {
            const updatedQuizCard = this.props.adminLessonContext.quizCards.find(
                (cardData) => cardData?._id === payload?._id
            );
            console.log({ updatedQuizCard });
            payload = {
                ...payload,
                ...updatedQuizCard,
                quiz: updatedQuizCard?.quiz ?? false,
            };
        }

        if (!isNew && payload?.quiz) {
            const newQuizData = {
                ...payload?.quiz,
                cardId: card?._id,
            };
            delete newQuizData._id;
            delete newQuizData.createdAt;
            delete newQuizData.updatedAt;
            delete newQuizData.__v;
            payload = {
                ...payload,
                quiz: newQuizData,
            };
        }

        if (!payload?.quiz) delete payload.quiz;

        delete payload._id;

        payload = await this.handleFileUploads(payload);

        if ((payload?.cardType === 'QUIZ' || payload?.draft?.cardType === 'QUIZ') && payload.quizId === '') {
            delete payload.quizId;
        }

        const { success, message, response } = await apiCall(
            isNew ? 'POST' : 'PUT',
            isNew
                ? `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/${
                      this.props.adminLessonContext.lesson._id
                  }/cards`
                : `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/cards/${card._id}`,
            payload
        );

        if (success) {
            if (isNew) {
                if (response.draft.cardType === 'QUIZ') {
                    this.props.adminLessonContext.handleUpdateQuizCard(response._id, payload.orderIndex);
                }
                this.props.adminLessonContext.patchLessonCard(payload.orderIndex, {
                    _id: response._id,
                });
            }
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: `[${card.orderIndex + 1}] ${card.cardTitle} could not be saved: ${message}`,
            });
            this.props.adminLessonContext.enableSaveButton();
        }
    };

    handleFileUploads = async (data) => {
        const payload = { ...data },
            messagesMap = {
                sourceImage: 'Image file',
                sourceAudio: 'Audio file',
                sourceDocument: 'Document file',
            };

        for (const sourceFieldKey of ['sourceImage', 'sourceAudio', 'sourceDocument', 'sourceIcon']) {
            if (!(sourceFieldKey in data)) {
                continue;
            }

            if (data[sourceFieldKey] instanceof File) {
                const form = new FormData();

                form.append('file', data[sourceFieldKey]);

                const {
                    success: isFileSaved,
                    response: { fileId } = {},
                    message,
                } = await apiCall('POST', '/files', form);

                if (isFileSaved) {
                    payload[sourceFieldKey] = fileId;
                } else {
                    this.props.setGlobalAlert({
                        type: 'error',
                        message: `${messagesMap[sourceFieldKey]} for [${data.orderIndex + 1}] ${
                            data.cardTitle
                        } could not be saved: ${message}`,
                    });
                    this.props.adminLessonContext.enableSaveButton();
                    return;
                }
            }
        }

        if (Array.isArray(payload['questions'])) {
            for (const question of payload['questions']) {
                if (Array.isArray(question.options)) {
                    for (const option of question.options) {
                        if (option.image instanceof File) {
                            const form = new FormData();

                            form.append('file', option.image);

                            const {
                                success: isFileSaved,
                                response: { fileId } = {},
                                message,
                            } = await apiCall('POST', '/files', form);

                            if (isFileSaved) {
                                option.image = fileId;
                            } else {
                                this.props.setGlobalAlert({
                                    type: 'error',
                                    message: `${messagesMap.sourceImage} for [${data.orderIndex + 1}] ${
                                        data.cardTitle
                                    } could not be saved: ${message}`,
                                });
                                this.props.adminLessonContext.enableSaveButton();
                                return;
                            }
                        }
                    }
                }
            }
        }

        if (Array.isArray(payload['imageTextList'])) {
            for (const listItem of payload['imageTextList']) {
                if (listItem.image instanceof File) {
                    const form = new FormData();

                    form.append('file', listItem.image);

                    const {
                        success: isFileSaved,
                        response: { fileId } = {},
                        message,
                    } = await apiCall('POST', '/files', form);
                    if (isFileSaved) {
                        listItem.image = fileId;
                    } else {
                        this.props.setGlobalAlert({
                            type: 'error',
                            message: `${messagesMap.sourceImage} for [${data.orderIndex + 1}] ${
                                data.cardTitle
                            } could not be saved: ${message}`,
                        });
                        this.props.adminLessonContext.enableSaveButton();
                        return;
                    }
                }
            }
        }

        if (Array.isArray(payload['horizontalListItems'])) {
            for (const listItem of payload['horizontalListItems']) {
                if (listItem.image instanceof File) {
                    const form = new FormData();

                    form.append('file', listItem.image);

                    const {
                        success: isFileSaved,
                        response: { fileId } = {},
                        message,
                    } = await apiCall('POST', '/files', form);
                    if (isFileSaved) {
                        listItem.image = fileId;
                    } else {
                        this.props.setGlobalAlert({
                            type: 'error',
                            message: `${messagesMap.sourceImage} for [${data.orderIndex + 1}] ${
                                data.cardTitle
                            } could not be saved: ${message}`,
                        });
                        this.props.adminLessonContext.enableSaveButton();
                        return;
                    }
                }
            }
        }

        if (Array.isArray(payload['mnemonicList'])) {
            for (const listRow of payload['mnemonicList']) {
                for (const listItem of listRow) {
                    if (listItem.image instanceof File) {
                        const form = new FormData();

                        form.append('file', listItem.image);

                        const {
                            success: isFileSaved,
                            response: { fileId } = {},
                            message,
                        } = await apiCall('POST', '/files', form);
                        if (isFileSaved) {
                            listItem.image = fileId;
                        } else {
                            this.props.setGlobalAlert({
                                type: 'error',
                                message: `${messagesMap.sourceImage} for [${data.orderIndex + 1}] ${
                                    data.cardTitle
                                } could not be saved: ${message}`,
                            });
                            this.props.adminLessonContext.enableSaveButton();
                            return;
                        }
                    }
                }
            }
        }

        return payload;
    };

    handleDeletedLessonCards = async () => {
        const notDeleted = [];

        if (this.props.adminLessonContext.deletedCards.length) {
            for (const { cardTitle, _id, orderIndex } of this.props.adminLessonContext.deletedCards) {
                const { success, message } = await apiCall(
                    'DELETE',
                    `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/cards/${_id}`
                );
                if (!success) {
                    this.props.setGlobalAlert({
                        type: 'error',
                        message: `[${orderIndex + 1}] ${cardTitle} could not be deleted: ${message}`,
                    });
                    notDeleted.push({ cardTitle, _id, orderIndex });
                }
            }
        }

        this.props.adminLessonContext.updateDeletedCards(notDeleted);
    };

    handlePublish = () => {
        if (this.props.match.params.coreId) {
            window.socket.emit('publish core lesson', this.props.match.params.lessonId);
        } else {
            window.socket.emit('publish course lesson', this.props.match.params.lessonId);
        }
    };

    handleRevert = async () => {
        const { lessonId } = this.props.match.params;
        const { success, message } = await apiCall(
            'POST',
            `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/${lessonId}/revert`
        );

        if (success) {
            this.props.history.go(0);
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: 'Failed to revert course lesson draft: ' + message,
            });
        }
    };

    render() {
        const { pageStatus, lessonForm } = this.props.adminLessonContext,
            { showRevertModal } = this.state;

        if (pageStatus === 'READY') {
            return (
                <>
                    <LessonFormInputs lessonForm={lessonForm} />
                    <div className='lesson-cards'>
                        <h5>Content</h5>
                        <LessonCards />
                    </div>
                    <Modal show={showRevertModal} onHide={this.handleShowRevertWarningModal}>
                        <Modal.Header closeButton>Revert draft changes to published?</Modal.Header>
                        <Modal.Body>
                            If you proceed with this action all the draft changes you have made will be lost and will be
                            reverted to the published version
                        </Modal.Body>
                        <Modal.Footer>
                            <button className='bd' onClick={this.handleRevert}>
                                Revert
                            </button>
                            <button className='bp' onClick={this.handleShowRevertWarningModal}>
                                Cancel
                            </button>
                        </Modal.Footer>
                    </Modal>
                </>
            );
        }

        return <Spinner />;
    }
}

export default connect(null, {
    setFormActions: (payload) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(LessonForm));
