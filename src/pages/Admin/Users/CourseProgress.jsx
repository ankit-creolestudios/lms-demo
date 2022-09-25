import React, { Component } from 'react';
import { Accordion, Card, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import apiCall from '../../../helpers/apiCall';
import { Table } from '../../../components/Table';
import { connect } from 'react-redux';
import CourseProgressAssessment from './CourseProgressAssessment';
import './CourseProgress.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faLockOpen, faCheck, faEye } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '../../../components/Spinner';
import { ConfirmationModal } from '../../../components/ConfirmationModal';

class CourseProgress extends Component {
    state = {
        chapters: [],
        checkedChapters: new Set(),
        checkedLessons: new Set(),
        bulkAction: '',
        updatedAt: '',
        lessonChapters: {},
        userCourse: null,
        modalShow: false,
    };

    allLessons = new Set();

    async componentDidMount() {
        await this.loadData();
    }

    loadData = async () => {
        const { courseId } = this.props,
            { success, response } = await apiCall('GET', `/users/courses/${courseId}/chapters/admin`);

        if (success) {
            this.allLessons = new Set();

            response.chapters.map((chapter) => (this[`ref-${chapter._id}`] = React.createRef()));

            this.setState({
                chapters: response.chapters,
                userCourse: response.userCourse,
            });
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
        let lessons = chapter.parentElement.parentElement.querySelectorAll('input[type="checkbox"][name^="lesson"]');

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
            props: { courseId },
        } = this;

        const { success, message } = await apiCall('POST', `/users/courses/${courseId}/many/${bulkAction}`, {
            chapters: Array.from(checkedChapters),
            lessons: Array.from(checkedLessons),
        });

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
    };

    handleSubmit = async (e) => {
        e.preventDefault();
        const { bulkAction } = this.state;

        if (bulkAction === 'reset') {
            this.setState({ modalShow: true });
        } else if (bulkAction) {
            this.submitAction();
        }
    };

    scrollingParent = (node) => {
        if (node == null) {
            return null;
        }
        if (
            node.scrollHeight - 1 > node.clientHeight ||
            getComputedStyle(node).getPropertyValue('overflow-y') === 'scroll'
        ) {
            return node;
        } else {
            return this.scrollingParent(node.parentNode);
        }
    };

    render() {
        const { chapters, checkedChapters, checkedLessons, bulkAction, userCourse } = this.state;

        if (!userCourse) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        }

        return (
            <div>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({ modalShow: false });
                    }}
                    confirmAction={() => {
                        this.submitAction();
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    titleText={'Are you sure?'}
                    bodyText={['You are about to ', <strong key='modal-type'>erase</strong>, ' all user progress.']}
                />
                <form onSubmit={this.handleSubmit}>
                    <div className='bulk-actions'>
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
                        <Form.Control as='select' onChange={this.handleActionSelect}>
                            <option value=''>Bulk action</option>
                            <option value='unlock'>Unlock selected</option>
                            <option value='complete'>Complete selected</option>
                            <option value='lock'>Lock selected</option>
                            <option value='reset'>Reset selected</option>
                        </Form.Control>
                        <Button
                            className='bd'
                            type='submit'
                            disabled={(checkedChapters.size === 0 && checkedLessons.size === 0) || !bulkAction}>
                            Update
                        </Button>
                    </div>

                    <Accordion className='table-tree' defaultActiveKey={userCourse?.lastChapterId || ''}>
                        {chapters.map((chapter) => {
                            return (
                                <Card key={chapter._id}>
                                    <Card.Header>
                                        <input
                                            type='checkbox'
                                            name={`chapter-${chapter._id}`}
                                            data-id={chapter._id}
                                            onChange={this.handleChapterCheck}
                                            checked={checkedChapters.has(chapter._id)}
                                        />
                                        <Accordion.Toggle as='span' eventKey={chapter._id}>
                                            {chapter.title}
                                        </Accordion.Toggle>
                                    </Card.Header>
                                    <Accordion.Collapse eventKey={chapter._id}>
                                        <Card.Body>
                                            <Table
                                                minTableWidth='1300px'
                                                rows={chapter?.lessons}
                                                columns={[
                                                    {
                                                        text: '',
                                                        field: (row) => {
                                                            this.allLessons.add(row._id);

                                                            return (
                                                                <input
                                                                    type='checkbox'
                                                                    name={`lesson-${row._id}`}
                                                                    data-id={row._id}
                                                                    onChange={this.handleLessonCheck}
                                                                    checked={this.state.checkedLessons.has(row._id)}
                                                                />
                                                            );
                                                        },
                                                        maxWidth: '1.5rem',
                                                    },
                                                    {
                                                        text: 'Lesson Name (Progress Time)',
                                                        field: (row) => (
                                                            <>
                                                                <OverlayTrigger
                                                                    placement='right'
                                                                    overlay={
                                                                        <Tooltip id={`ltt-${row._id}`}>
                                                                            {row.title}
                                                                        </Tooltip>
                                                                    }>
                                                                    <span>{row.title}</span>
                                                                </OverlayTrigger>
                                                                <div>
                                                                    &nbsp;(
                                                                    {new Date(row.maxTime * 60000)
                                                                        .toISOString()
                                                                        .substr(11, 8)}
                                                                    )
                                                                </div>
                                                            </>
                                                        ),
                                                        minWidth: '30rem',
                                                        className: 'limitTitle',
                                                    },
                                                    {
                                                        text: 'Status',
                                                        field: (row) => {
                                                            if (row._id === this.state.userCourse.lastLessonId) {
                                                                return (
                                                                    <div className='alignIconCenter'>
                                                                        <FontAwesomeIcon icon={faEye} />
                                                                        &nbsp;Active
                                                                    </div>
                                                                );
                                                            }

                                                            if (row.completed) {
                                                                return (
                                                                    <div className='alignIconCenter'>
                                                                        <FontAwesomeIcon icon={faCheck} />
                                                                        &nbsp;Complete
                                                                    </div>
                                                                );
                                                            }
                                                            if (row.unlocked) {
                                                                return (
                                                                    <div className='alignIconCenter'>
                                                                        <FontAwesomeIcon icon={faLockOpen} />
                                                                        &nbsp;Unlocked
                                                                    </div>
                                                                );
                                                            }

                                                            return (
                                                                <div className='alignIconCenter'>
                                                                    <FontAwesomeIcon icon={faLock} />
                                                                    &nbsp;Locked
                                                                </div>
                                                            );
                                                        },
                                                        minWidth: '10rem',
                                                    },
                                                    {
                                                        text: 'Time spent',
                                                        field: (row) => {
                                                            const enteredAtLength = row?.enteredAt?.length,
                                                                currentTime = Array.isArray(row.enteredAt)
                                                                    ? row.enteredAt.reduce(
                                                                          (returnValue, currentDate, currentIndex) => {
                                                                              const enteredAt = new Date(currentDate),
                                                                                  leftAt =
                                                                                      currentIndex ===
                                                                                          enteredAtLength - 1 &&
                                                                                      (!row.leftAt ||
                                                                                          !row.leftAt[currentIndex])
                                                                                          ? new Date()
                                                                                          : new Date(
                                                                                                row.leftAt[currentIndex]
                                                                                            );

                                                                              returnValue +=
                                                                                  leftAt.getTime() -
                                                                                  enteredAt.getTime();
                                                                              return returnValue;
                                                                          },
                                                                          0
                                                                      )
                                                                    : 0;

                                                            return new Date(
                                                                !Number.isNaN(currentTime) ? currentTime : 0
                                                            )
                                                                .toISOString()
                                                                .substr(11, 8);
                                                        },
                                                        minWidth: '10rem',
                                                    },
                                                    {
                                                        text: 'Completed at',
                                                        field: (row) =>
                                                            row.completed
                                                                ? new Date(row.completed).toLocaleString('en-US')
                                                                : '-',
                                                        minWidth: '15rem',
                                                    },
                                                    {
                                                        text: 'Assessment',
                                                        className: 'col--flex',
                                                        field: (row) =>
                                                            row.isQuiz ? (
                                                                <CourseProgressAssessment
                                                                    lessonId={row._id}
                                                                    buttonClassName={row.currentTime > 0 ? 'bp' : 'bd'}
                                                                />
                                                            ) : (
                                                                '-'
                                                            ),
                                                        minWidth: '10rem',
                                                    },
                                                ]}
                                            />
                                        </Card.Body>
                                    </Accordion.Collapse>
                                </Card>
                            );
                        })}
                    </Accordion>
                </form>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(CourseProgress);
