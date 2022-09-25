import React, { Component, useContext } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import Select from 'react-select';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import apiCall from '../../../../../helpers/apiCall';
import { Table } from '../../../../../components/Table';
import { Spinner } from '../../../../../components/Spinner';
import { ConfirmationModal } from '../../../../../components/ConfirmationModal';
import AddNewItemBar from '../AddNewItemBar';
import LessonInput from './LessonInput';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
    faCheck,
    faPencilAlt,
    faEdit,
    faTrashAlt,
    faCaretDown,
    faCaretUp,
    faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';

import { faClone as farClone } from '@fortawesome/free-regular-svg-icons';
import { Accordion, Card, Form, Button, OverlayTrigger, Tooltip, AccordionContext } from 'react-bootstrap';

import '../../../Users/CourseProgress.scss';
import { Api } from 'src/helpers/new';

function CaretToggle() {
    const currentEventKey = useContext(AccordionContext);

    return (
        <Button variant='link' type='button'>
            <FontAwesomeIcon icon={currentEventKey ? faCaretUp : faCaretDown} />
        </Button>
    );
}

class CourseContent extends Component {
    state = {
        isLoading: false,
        chapters: [],
        checkedChapters: new Set(),
        checkedLessons: new Set(),
        bulkAction: '',

        totalProgressTime: 0,
        totalRequiredTime: 0,

        modalShow: false,
        modalAction: () => {},
        modalText: '',

        activeChapterId: '',
    };

    allLessons = new Set();

    UNLOCK_LESSON_OPTS = {
        ALWAYS_UNLOCKED: 'All time',
        ON_LESSON_START: 'When started',
        REQUIRED_TIME_MET: 'When Timer Met',
        ON_QUIZ_START: 'When Quiz Started',
        ON_QUIZ_END: 'When Quiz Finished',
        ON_QUIZ_PASS: 'When Quiz Passed',
    };

    unlockLessonOpts = [];

    constructor(props) {
        super(props);
        this.unlockLessonOpts = Object.keys(this.UNLOCK_LESSON_OPTS).map((condition) => {
            return {
                value: condition,
                label: this.UNLOCK_LESSON_OPTS[condition],
            };
        });
    }

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        if (this.props.courseId) {
            this.setState({ isLoading: true });
            const { success, response } = await Api.call('GET', `/courses/chapters/course/${this.props.courseId}`);

            if (success) {
                this.allLessons = new Set();

                const chapters = !Array.isArray(response)
                    ? response.chapters.map((chapter) => {
                          this[`ref-${chapter._id}`] = React.createRef();

                          const lessons = chapter.lessons.map((lesson) => {
                              this.allLessons.add(lesson._id);
                              lesson.editable = {
                                  title: false,
                                  maxTime: false,
                                  requiredTime: false,
                                  unlockNextLesson: false,
                              };
                              if (!lesson.unlockNextLesson) {
                                  lesson.unlockNextLesson = 'ALWAYS_UNLOCKED';
                              }
                              return lesson;
                          });

                          return {
                              ...chapter,
                              lessons,
                              editable: {
                                  title: false,
                              },
                          };
                      })
                    : [];

                this.setState({
                    chapters,
                });
                this.recalculateTotalTimes();
            }
            this.setState({ isLoading: false });
        }
    };

    handleSelectAll = (e) => {
        if (e.target.checked) {
            this.setState({
                checkedChapters: new Set(this.state.chapters.map((chapter) => chapter._id)),
                checkedLessons: new Set(this.allLessons),
            });
        } else {
            this.setState({
                checkedChapters: new Set(),
                checkedLessons: new Set(),
            });
        }
    };

    handleChapterCheck = (e) => {
        const { checkedChapters, checkedLessons } = this.state,
            chapter = e.target;
        let lessons = chapter.parentElement.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
            'input[type="checkbox"][name^="lesson"]'
        );

        if (lessons.length) {
            lessons = [...lessons];
        }

        if (chapter.checked) {
            checkedChapters.add(chapter.dataset.id);
            lessons.map((lesson) => checkedLessons.add(lesson.dataset.id));
        } else {
            checkedChapters.delete(chapter.dataset.id, 1);
            lessons.map((lesson) => checkedLessons.delete(lesson.dataset.id));
        }

        this.setState({
            checkedChapters,
            checkedLessons,
        });
    };

    handleLessonCheck = (e) => {
        const { checkedLessons } = this.state,
            lesson = e.target;

        if (lesson.checked) {
            checkedLessons.add(lesson.dataset.id);
        } else {
            checkedLessons.delete(lesson.dataset.id);
        }

        this.setState({
            checkedLessons,
        });
    };

    handleActionSelect = (e) => {
        this.setState({
            bulkAction: e.target.value,
        });
    };

    submitAction = async () => {
        const {
            state: { bulkAction, checkedChapters, checkedLessons },
        } = this;

        const { success, message } = await apiCall('PATCH', '/courses/lessons/bulk', {
            lessons: Array.from(checkedLessons),
            fields: {
                unlockNextLesson: bulkAction,
            },
        });

        if (success) {
            this.props.setGlobalAlert({
                type: success ? 'success' : 'error',
                message,
            });

            this.setState(
                {
                    checkedChapters: new Set(),
                    checkedLessons: new Set(),
                },
                this.loadData
            );
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        let { bulkAction, checkedLessons } = this.state;

        if (!bulkAction || !checkedLessons.size) {
            return;
        }

        checkedLessons = Array.from(checkedLessons);

        if (bulkAction === 'DELETE_SELECTED') {
            this.setState({
                modalShow: true,
                modalText: 'delete selected lessons',
                modalAction: async () => {
                    const { success, message } = await apiCall(
                        'DELETE',
                        `/courses/lessons/${checkedLessons.join(',')}`
                    );

                    if (success) {
                        this.props.setGlobalAlert({
                            type: success ? 'success' : 'error',
                            message,
                        });

                        this.setState(
                            {
                                checkedChapters: new Set(),
                                checkedLessons: new Set(),
                            },
                            this.loadData
                        );
                    }
                },
            });
        } else {
            this.submitAction();
        }
    };

    handleChapterChange = (chapterId, prop, updateObj) => {
        this.setState({
            chapters: this.state.chapters.map((chapter) => {
                if (chapter._id === chapterId) {
                    return {
                        ...chapter,
                        [prop]: updateObj,
                    };
                } else {
                    return chapter;
                }
            }),
        });
    };

    recalculateTotalTimes = (chapter, updatedLesson) => {
        if (chapter && updatedLesson) {
            this.setState({
                chapters: this.state.chapters.map((stateChapter) => {
                    if (stateChapter._id === chapter._id) {
                        stateChapter.lessons = stateChapter.lessons.map((lesson) => {
                            if (lesson._id === updatedLesson._id) {
                                return updatedLesson;
                            } else {
                                return lesson;
                            }
                        });
                    }
                    return stateChapter;
                }),
            });
        }

        let totalProgressTime = 0;
        let totalRequiredTime = 0;

        const chapters = this.state.chapters.map((chapter) => {
            chapter = this.calculateChapterTimes(chapter);
            totalProgressTime += chapter.maxTime;
            totalRequiredTime += chapter.requiredTime;
            return chapter;
        });

        this.setState({
            chapters,
            totalProgressTime,
            totalRequiredTime,
        });
    };

    calculateChapterTimes = (chapter) => {
        const maxTime = chapter.lessons.reduce((accumulator, lesson) => {
            const t = lesson.maxTime;
            return accumulator + parseInt(t ? t : 0);
        }, 0);
        const reqTime = chapter.lessons.reduce((accumulator, lesson) => {
            const t = lesson.requiredTime;
            return accumulator + parseInt(t ? t : 0);
        }, 0);
        chapter.maxTime = maxTime;
        chapter.requiredTime = reqTime;
        return chapter;
    };

    submitLesson = async (chapter, lesson, prop, isSyncAttribute) => {
        const { success, message } = await apiCall('PATCH', `/courses/lessons/${lesson._id}`, { [prop]: lesson[prop], isSyncAttribute });

        this.props.setGlobalAlert({
            type: success ? 'success' : 'error',
            message,
        });
    };

    submitChapter = async (chapter, isSyncAttribute) => {
        const { success, message } = await apiCall('PUT', `/courses/chapters/${chapter._id}`, {
            title: chapter.title,
            menuIndex: chapter.menuIndex,
            isSyncAttribute
        });

        if (success) {
            this.handleChapterChange(chapter._id, 'editable', {
                ...chapter.editable,
                title: false,
            });
        }

        this.props.setGlobalAlert({
            type: success ? 'success' : 'error',
            message,
        });
    };

    handleDragAndDropChapter = (result) => {
        if (!result.destination || result.destination.index === result.source.index) return;

        let items = [...this.state.chapters];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        this.setState({
            chapters: items.map((item, i) => {
                if (item.menuIndex !== i) {
                    item.menuIndex = i;
                    this.submitChapter(item, true);
                }
                return item;
            }),
        });
    };

    handleDragAndDropLesson = (chapterId, result) => {
        if (!result.destination || result.destination.index === result.source.index) return;

        const chapters = this.state.chapters.map((chapter) => {
            if (chapterId === chapter._id) {
                let lessons = [...chapter.lessons];
                const [reorderedItem] = lessons.splice(result.source.index, 1);
                lessons.splice(result.destination.index, 0, reorderedItem);

                chapter.lessons = lessons.map((lesson, i) => {
                    if (lesson.menuIndex !== i) {
                        lesson.menuIndex = i;
                        this.submitLesson(chapter, lesson, 'menuIndex', true);
                    }
                    return lesson;
                });
            }
            return chapter;
        });

        this.setState({
            chapters,
        });
    };

    convertTime = (time) => {
        let hrs = Math.floor(time / 60);
        let mins = time - hrs * 60;
        return hrs + 'h' + ' ' + mins + 'm';
    };

    delete = async (type, docId) => {
        const url = `/courses/${type}s/${docId}`;
        const { success, response, message } = await apiCall('DELETE', url);

        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? `${type[0].toUpperCase() + type.substr(1)} has been deleted`,
            });

            this.loadData();
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? `There was an unexpected problem with deleting this ${type}`,
            });
        }
    };

    clone = async (type, docId) => {
        const url = `/courses/${type}s/${docId}/clone`;
        const { success, response, message } = await apiCall('POST', url);

        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? `${type[0].toUpperCase() + type.substr(1)} has been cloned`,
            });
            this.loadData();
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? `There was an unexpected problem with cloning this ${type}`,
            });
        }
    };

    addNewItem = async (title, type, parentId, menuIndex) => {
        const url = `/courses/${type}s`;
        const parentType = type === 'lesson' ? 'chapterId' : 'courseId';
        const { success, response, message } = await apiCall('POST', url, {
            [parentType]: parentId,
            title,
            menuIndex,
        });

        this.props.setGlobalAlert({
            type: success ? 'success' : 'error',
            message,
        });

        if (success) {
            this.loadData();
        }
    };

    render() {
        const { chapters, checkedChapters, checkedLessons, bulkAction } = this.state,
            queryString = new URLSearchParams(this.props.location.search);

        if (this.state.isLoading) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        } else {
            return (
                <div>
                    <ConfirmationModal
                        show={this.state.modalShow}
                        hideModal={() => {
                            this.setState({ modalShow: false });
                        }}
                        confirmAction={() => {
                            this.state.modalAction();
                            this.setState({
                                modalShow: false,
                            });
                        }}
                        titleText={'Are you sure?'}
                        bodyText={['You are about to ', <strong key='modal-type'>{this.state.modalText}</strong>, '.']}
                    />

                    <form onSubmit={this.handleSubmit}>
                        <div className='bulk-actions'>
                            <div
                                style={{
                                    width: '14%',
                                    paddingTop: '8px',
                                }}
                            >
                                <label htmlFor='selectAll'>
                                    <input
                                        type='checkbox'
                                        name='selectAll'
                                        id='selectAll'
                                        onChange={this.handleSelectAll}
                                        checked={
                                            checkedChapters.size === chapters.length &&
                                            checkedLessons.size === this.allLessons.size
                                        }
                                    />
                                    &nbsp; Select all
                                </label>
                            </div>
                            <div
                                style={{
                                    width: '26%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <div className='px-3'>
                                    <strong>Total Progress:&nbsp;</strong>
                                    <div className='d-inline-block'>
                                        {this.convertTime(this.state.totalProgressTime)}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    width: '26%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <div className='px-3'>
                                    <strong>Total Required:&nbsp;</strong>
                                    <div className='d-inline-block'>
                                        {this.convertTime(this.state.totalRequiredTime)}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    width: '34%',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                <Form.Control as='select' onChange={this.handleActionSelect}>
                                    <option value=''>Bulk action</option>
                                    <option value='ON_LESSON_START'>Update to When Started</option>
                                    <option value='REQUIRED_TIME_MET'>Update to When Timer Met</option>
                                    <option value='ON_QUIZ_START'>Update to When Quiz Started</option>
                                    <option value='ON_QUIZ_END'>Update to When Quiz Finished</option>
                                    <option value='ON_QUIZ_PASS'>Update to When Quiz Passed</option>
                                    <option value='DELETE_SELECTED'>Delete Selected</option>
                                </Form.Control>
                                <Button
                                    className='bd'
                                    type='submit'
                                    disabled={(checkedChapters.size === 0 && checkedLessons.size === 0) || !bulkAction}
                                >
                                    Update
                                </Button>
                            </div>
                        </div>

                        <Accordion
                            className='table-tree'
                            defaultActiveKey={this.state.activeChapterId || queryString.get('focus')}
                        >
                            <DragDropContext onDragEnd={this.handleDragAndDropChapter}>
                                <Droppable droppableId='droppable-chapters'>
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef}>
                                            {chapters.map((chapter, i) => {
                                                return (
                                                    <Draggable
                                                        key={`draggable-chapter-${chapter._id}`}
                                                        draggableId={`draggable-chapter-${chapter._id}`}
                                                        index={i}
                                                    >
                                                        {(provided) => (
                                                            <Card
                                                                key={chapter._id}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                            >
                                                                <Card.Header>
                                                                    <Accordion.Toggle
                                                                        as='div'
                                                                        style={{
                                                                            display: 'flex',
                                                                            justifyContent: 'space-between',
                                                                            alignItems: 'center',
                                                                            height: '56px',
                                                                        }}
                                                                        eventKey={chapter._id}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                display: 'flex',
                                                                                width: '6%',
                                                                                minWidth: '70px',
                                                                                maxWidth: '82px',
                                                                                justifyContent: 'flex-start',
                                                                                alignItems: 'center',
                                                                            }}
                                                                        >
                                                                            <div>
                                                                                <span
                                                                                    style={{
                                                                                        padding: '0 0 0 10px',
                                                                                    }}
                                                                                    {...provided.dragHandleProps}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon
                                                                                        icon={faEllipsisV}
                                                                                    />
                                                                                </span>
                                                                            </div>
                                                                            <div>
                                                                                <input
                                                                                    style={{
                                                                                        margin: '4px 0 0 20px',
                                                                                    }}
                                                                                    type='checkbox'
                                                                                    name={`chapter-${chapter._id}`}
                                                                                    data-id={chapter._id}
                                                                                    onChange={this.handleChapterCheck}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                    }}
                                                                                    checked={checkedChapters.has(
                                                                                        chapter._id
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            style={{
                                                                                width: '30%',
                                                                            }}
                                                                        >
                                                                            {chapter.editable?.title ? (
                                                                                <Form.Control
                                                                                    className='d-inline-block'
                                                                                    type='text'
                                                                                    required
                                                                                    minLength='3'
                                                                                    maxLength='512'
                                                                                    name='title'
                                                                                    value={chapter.title}
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                    }}
                                                                                    onChange={(event) => {
                                                                                        this.handleChapterChange(
                                                                                            chapter._id,
                                                                                            'title',
                                                                                            event.target.value
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                chapter.title
                                                                            )}
                                                                            {chapter.editable?.title ? (
                                                                                <button
                                                                                    type='button'
                                                                                    className='btn bp ml-2'
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        this.submitChapter(chapter);
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                                </button>
                                                                            ) : (
                                                                                <FontAwesomeIcon
                                                                                    onClick={(event) => {
                                                                                        event.stopPropagation();
                                                                                        this.handleChapterChange(
                                                                                            chapter._id,
                                                                                            'editable',
                                                                                            {
                                                                                                ...chapter.editable,
                                                                                                title: true,
                                                                                            }
                                                                                        );
                                                                                    }}
                                                                                    style={{
                                                                                        cursor: 'pointer',
                                                                                        fontSize: '14px',
                                                                                        marginLeft: '7px',
                                                                                    }}
                                                                                    icon={faPencilAlt}
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <div
                                                                            className='px-3'
                                                                            style={{
                                                                                width: '20%',
                                                                            }}
                                                                        >
                                                                            <strong>Progress:&nbsp;</strong>
                                                                            <div className='d-inline-block'>
                                                                                {this.convertTime(chapter.maxTime)}
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            className='px-3'
                                                                            style={{
                                                                                width: '20%',
                                                                            }}
                                                                        >
                                                                            <strong>Required:&nbsp;</strong>
                                                                            <div className='d-inline-block'>
                                                                                {this.convertTime(chapter.requiredTime)}
                                                                            </div>
                                                                        </div>
                                                                        <div
                                                                            style={{
                                                                                width: '24%',
                                                                                display: 'flex',
                                                                                justifyContent: 'flex-end',
                                                                                paddingRight: '10px',
                                                                            }}
                                                                        >
                                                                            <OverlayTrigger
                                                                                key={`tooltip-delete-${chapter._id}`}
                                                                                placement='top'
                                                                                overlay={
                                                                                    <Tooltip
                                                                                        id={`tooltip-delete-${chapter._id}`}
                                                                                    >
                                                                                        Delete
                                                                                    </Tooltip>
                                                                                }
                                                                            >
                                                                                <Button
                                                                                    variant='link'
                                                                                    type='button'
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        this.setState({
                                                                                            modalShow: true,
                                                                                            modalText:
                                                                                                'delete this chapter',
                                                                                            modalAction: () => {
                                                                                                this.delete(
                                                                                                    'chapter',
                                                                                                    chapter._id
                                                                                                );
                                                                                            },
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon
                                                                                        icon={faTrashAlt}
                                                                                    />
                                                                                </Button>
                                                                            </OverlayTrigger>
                                                                            <OverlayTrigger
                                                                                key={`tooltip-clone-${chapter._id}`}
                                                                                placement='top'
                                                                                overlay={
                                                                                    <Tooltip
                                                                                        id={`tooltip-clone-${chapter._id}`}
                                                                                    >
                                                                                        Clone
                                                                                    </Tooltip>
                                                                                }
                                                                            >
                                                                                <Button
                                                                                    variant='link'
                                                                                    type='button'
                                                                                    className='mx-2'
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        this.setState({
                                                                                            modalShow: true,
                                                                                            modalText:
                                                                                                'clone this chapter',
                                                                                            modalAction: () => {
                                                                                                this.clone(
                                                                                                    'chapter',
                                                                                                    chapter._id
                                                                                                );
                                                                                                this.setState({
                                                                                                    activeChapterId:
                                                                                                        chapter._id,
                                                                                                });
                                                                                            },
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <FontAwesomeIcon icon={farClone} />
                                                                                </Button>
                                                                            </OverlayTrigger>
                                                                            <CaretToggle />
                                                                        </div>
                                                                    </Accordion.Toggle>
                                                                </Card.Header>
                                                                <Accordion.Collapse eventKey={chapter._id}>
                                                                    <Card.Body>
                                                                        <Table
                                                                            handleDragAndDrop={
                                                                                this.handleDragAndDropLesson
                                                                            }
                                                                            highlightRow={(row) => {
                                                                                return this.props.location.search.includes(
                                                                                    row._id
                                                                                );
                                                                            }}
                                                                            chapter={chapter}
                                                                            droppableId='lessons'
                                                                            draggableId='lesson'
                                                                            minTableWidth='992px'
                                                                            // minTableWidth='1300px'
                                                                            rows={chapter?.lessons}
                                                                            columns={[
                                                                                {
                                                                                    text: '',
                                                                                    field: (row) => {
                                                                                        return (
                                                                                            <div
                                                                                                style={{
                                                                                                    display: 'block',
                                                                                                    width: '70px',
                                                                                                }}
                                                                                            >
                                                                                                <div
                                                                                                    className='d-inline-block pl-1'
                                                                                                    style={{
                                                                                                        width: '40%',
                                                                                                    }}
                                                                                                >
                                                                                                    <span
                                                                                                        style={{
                                                                                                            padding: 0,
                                                                                                        }}
                                                                                                        {...row.provided
                                                                                                            .dragHandleProps}
                                                                                                        onClick={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            e.stopPropagation();
                                                                                                        }}
                                                                                                    >
                                                                                                        <FontAwesomeIcon
                                                                                                            icon={
                                                                                                                faEllipsisV
                                                                                                            }
                                                                                                        />
                                                                                                    </span>
                                                                                                </div>
                                                                                                <div
                                                                                                    className='d-inline-block px-1'
                                                                                                    style={{
                                                                                                        width: '60%',
                                                                                                    }}
                                                                                                >
                                                                                                    <input
                                                                                                        type='checkbox'
                                                                                                        name={`lesson-${row._id}`}
                                                                                                        data-id={
                                                                                                            row._id
                                                                                                        }
                                                                                                        onChange={
                                                                                                            this
                                                                                                                .handleLessonCheck
                                                                                                        }
                                                                                                        checked={this.state.checkedLessons.has(
                                                                                                            row._id
                                                                                                        )}
                                                                                                    />
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    },
                                                                                    minWidth: '6%',
                                                                                    maxWidth: '6%',
                                                                                },
                                                                                {
                                                                                    text: 'Lesson Name',
                                                                                    field: (row) => {
                                                                                        return (
                                                                                            <LessonInput
                                                                                                doc={row}
                                                                                                type='text'
                                                                                                prop='title'
                                                                                                setGlobalAlert={
                                                                                                    this.props
                                                                                                        .setGlobalAlert
                                                                                                }
                                                                                                source='courses'
                                                                                            />
                                                                                        );
                                                                                    },

                                                                                    maxWidth: '29%',
                                                                                    minWidth: '29%',
                                                                                },
                                                                                {
                                                                                    text: 'Progress Time',
                                                                                    field: (row) => {
                                                                                        return (
                                                                                            <LessonInput
                                                                                                doc={row}
                                                                                                type='number'
                                                                                                prop='maxTime'
                                                                                                recalculateTotalTimes={(
                                                                                                    updatedLesson
                                                                                                ) => {
                                                                                                    this.recalculateTotalTimes(
                                                                                                        chapter,
                                                                                                        updatedLesson
                                                                                                    );
                                                                                                }}
                                                                                                setGlobalAlert={
                                                                                                    this.props
                                                                                                        .setGlobalAlert
                                                                                                }
                                                                                                source='courses'
                                                                                            />
                                                                                        );
                                                                                    },
                                                                                    maxWidth: '14%',
                                                                                    minWidth: '14%',
                                                                                },
                                                                                {
                                                                                    text: 'Required Time',
                                                                                    field: (row) => {
                                                                                        return (
                                                                                            <LessonInput
                                                                                                doc={row}
                                                                                                type='number'
                                                                                                prop='requiredTime'
                                                                                                recalculateTotalTimes={(
                                                                                                    updatedLesson
                                                                                                ) => {
                                                                                                    this.recalculateTotalTimes(
                                                                                                        chapter,
                                                                                                        updatedLesson
                                                                                                    );
                                                                                                }}
                                                                                                setGlobalAlert={
                                                                                                    this.props
                                                                                                        .setGlobalAlert
                                                                                                }
                                                                                                source='courses'
                                                                                            />
                                                                                        );
                                                                                    },
                                                                                    maxWidth: '14%',
                                                                                    minWidth: '14%',
                                                                                },
                                                                                {
                                                                                    text: 'Unlock Next Lesson',
                                                                                    field: (row) => {
                                                                                        return (
                                                                                            <LessonInput
                                                                                                doc={row}
                                                                                                source='courses'
                                                                                                prop='unlockNextLesson'
                                                                                                setGlobalAlert={
                                                                                                    this.props
                                                                                                        .setGlobalAlert
                                                                                                }
                                                                                                translateValue={(
                                                                                                    value
                                                                                                ) => {
                                                                                                    return this
                                                                                                        .UNLOCK_LESSON_OPTS[
                                                                                                        value
                                                                                                    ];
                                                                                                }}
                                                                                                inputField={(
                                                                                                    value,
                                                                                                    handleChange
                                                                                                ) => (
                                                                                                    <Select
                                                                                                        menuShouldBlockScroll={
                                                                                                            true
                                                                                                        }
                                                                                                        name='unlockNextLesson'
                                                                                                        defaultValue={
                                                                                                            value
                                                                                                                ? value
                                                                                                                : 'ALWAYS_UNLOCKED'
                                                                                                        }
                                                                                                        value={
                                                                                                            this.unlockLessonOpts.filter(
                                                                                                                (
                                                                                                                    opt
                                                                                                                ) => {
                                                                                                                    return (
                                                                                                                        opt.value ===
                                                                                                                        value
                                                                                                                    );
                                                                                                                }
                                                                                                            )[0]
                                                                                                        }
                                                                                                        options={
                                                                                                            this
                                                                                                                .unlockLessonOpts
                                                                                                        }
                                                                                                        menuPortalTarget={
                                                                                                            document.body
                                                                                                        }
                                                                                                        menuPosition={
                                                                                                            'fixed'
                                                                                                        }
                                                                                                        styles={{
                                                                                                            menuPortal:
                                                                                                                (
                                                                                                                    base
                                                                                                                ) => ({
                                                                                                                    ...base,
                                                                                                                    zIndex: 9999,
                                                                                                                }),
                                                                                                        }}
                                                                                                        closeMenuOnScroll={(
                                                                                                            event
                                                                                                        ) => {
                                                                                                            return (
                                                                                                                event
                                                                                                                    .target
                                                                                                                    .id ===
                                                                                                                'mainContainerId'
                                                                                                            );
                                                                                                        }}
                                                                                                        onChange={(
                                                                                                            event
                                                                                                        ) => {
                                                                                                            handleChange(
                                                                                                                event.value
                                                                                                            );
                                                                                                        }}
                                                                                                    ></Select>
                                                                                                )}
                                                                                            />
                                                                                        );
                                                                                    },
                                                                                    maxWidth: '24%',
                                                                                    minWidth: '24%',
                                                                                },
                                                                                {
                                                                                    text: '',
                                                                                    field: (row) => {
                                                                                        return (
                                                                                            <div
                                                                                                style={{
                                                                                                    display: 'flex',
                                                                                                    justifyContent:
                                                                                                        'flex-end',
                                                                                                }}
                                                                                            >
                                                                                                <OverlayTrigger
                                                                                                    key={`tooltip-delete-${row._id}`}
                                                                                                    placement='top'
                                                                                                    overlay={
                                                                                                        <Tooltip
                                                                                                            id={`tooltip-delete-${row._id}`}
                                                                                                        >
                                                                                                            Delete
                                                                                                        </Tooltip>
                                                                                                    }
                                                                                                >
                                                                                                    <Button
                                                                                                        variant='link'
                                                                                                        type='button'
                                                                                                        onClick={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            e.stopPropagation();
                                                                                                            this.setState(
                                                                                                                {
                                                                                                                    modalShow: true,
                                                                                                                    modalText:
                                                                                                                        'delete this lesson',
                                                                                                                    modalAction:
                                                                                                                        () => {
                                                                                                                            this.delete(
                                                                                                                                'lesson',
                                                                                                                                row._id
                                                                                                                            );
                                                                                                                            this.setState(
                                                                                                                                {
                                                                                                                                    activeChapterId:
                                                                                                                                        chapter._id,
                                                                                                                                }
                                                                                                                            );
                                                                                                                        },
                                                                                                                }
                                                                                                            );
                                                                                                        }}
                                                                                                    >
                                                                                                        <FontAwesomeIcon
                                                                                                            icon={
                                                                                                                faTrashAlt
                                                                                                            }
                                                                                                        />
                                                                                                    </Button>
                                                                                                </OverlayTrigger>
                                                                                                <OverlayTrigger
                                                                                                    key={`tooltip-clone-${row._id}`}
                                                                                                    placement='top'
                                                                                                    overlay={
                                                                                                        <Tooltip
                                                                                                            id={`tooltip-clone-${row._id}`}
                                                                                                        >
                                                                                                            Clone
                                                                                                        </Tooltip>
                                                                                                    }
                                                                                                >
                                                                                                    <Button
                                                                                                        variant='link'
                                                                                                        type='button'
                                                                                                        className='mx-2'
                                                                                                        onClick={(
                                                                                                            e
                                                                                                        ) => {
                                                                                                            e.stopPropagation();
                                                                                                            this.setState(
                                                                                                                {
                                                                                                                    modalShow: true,
                                                                                                                    modalText:
                                                                                                                        'clone this lesson',
                                                                                                                    modalAction:
                                                                                                                        () => {
                                                                                                                            this.clone(
                                                                                                                                'lesson',
                                                                                                                                row._id
                                                                                                                            );
                                                                                                                        },
                                                                                                                }
                                                                                                            );
                                                                                                        }}
                                                                                                    >
                                                                                                        <FontAwesomeIcon
                                                                                                            icon={
                                                                                                                farClone
                                                                                                            }
                                                                                                        />
                                                                                                    </Button>
                                                                                                </OverlayTrigger>
                                                                                                <OverlayTrigger
                                                                                                    key={`tooltip-edit-${row._id}`}
                                                                                                    placement='top'
                                                                                                    overlay={
                                                                                                        <Tooltip
                                                                                                            id={`tooltip-edit-${row._id}`}
                                                                                                        >
                                                                                                            Edit
                                                                                                        </Tooltip>
                                                                                                    }
                                                                                                >
                                                                                                    <Link
                                                                                                        className='btn'
                                                                                                        to={`/admin/courses/${this.props.courseId}/chapters/${chapter._id}/lessons/${row._id}`}
                                                                                                    >
                                                                                                        <FontAwesomeIcon
                                                                                                            icon={
                                                                                                                faEdit
                                                                                                            }
                                                                                                        />
                                                                                                    </Link>
                                                                                                </OverlayTrigger>
                                                                                            </div>
                                                                                        );
                                                                                    },
                                                                                    maxWidth: '13%',
                                                                                    minWidth: '13%',
                                                                                },
                                                                            ]}
                                                                        />
                                                                        <AddNewItemBar
                                                                            type='lesson'
                                                                            addNewItem={(
                                                                                title,
                                                                                type,
                                                                                parentId,
                                                                                numOfItems
                                                                            ) => {
                                                                                this.addNewItem(
                                                                                    title,
                                                                                    type,
                                                                                    parentId,
                                                                                    numOfItems
                                                                                );
                                                                                this.setState({
                                                                                    activeChapterId: chapter._id,
                                                                                });
                                                                            }}
                                                                            parentId={chapter._id}
                                                                            numOfItems={chapter.lessons.length}
                                                                            loadData={this.loadData}
                                                                        />
                                                                    </Card.Body>
                                                                </Accordion.Collapse>
                                                            </Card>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </Accordion>
                    </form>
                    <AddNewItemBar
                        type='chapter'
                        addNewItem={this.addNewItem}
                        parentId={this.props.courseId}
                        numOfItems={this.state.chapters.length}
                    />
                </div>
            );
        }
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(CourseContent));
