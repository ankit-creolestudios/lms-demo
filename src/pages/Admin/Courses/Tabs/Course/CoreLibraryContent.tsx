import React, { Component } from 'react';
import { Accordion, Card, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import '../../../Users/CourseProgress.scss';
import { Table } from 'src/components/Table';
import { Spinner } from 'src/components/Spinner';
import { Api } from 'src/helpers/new';
import { ApiTable } from 'src/components/ApiTable';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

interface IProps {
    courseChapterId: string;
    numOfItems?: number;
    closeManageModal: () => void;
    loadData: () => Promise<void>;
    setGlobalAlert: (payload: any) => {
        type: string;
        payload: any;
    };
}

interface IState {
    isLoading: boolean;
    chapters: ChapterType[] | [];
    checkedChapters: Set<unknown>;
    checkedLessons: Set<unknown>;
    updatedAt: string;
    modalShow: boolean;
    isCreatedAsStatic: boolean;
    coreLibraryId: string | null;
    changedLessons:
        | {
              chapterId: string;
              lessons: string[];
          }[]
        | [];
}

type ChapterType = {
    chapterTime: any;
    coreLibraryId: string;
    lessons: any;
    menuIndex: number;
    title: string;
    _id: string;
};

class CoreLibraryContent extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: false,
            chapters: [],
            checkedChapters: new Set(),
            checkedLessons: new Set(),
            updatedAt: '',
            modalShow: false,
            isCreatedAsStatic: false,
            coreLibraryId: null,
            changedLessons: [],
        };
    }

    allLessons = new Set();

    async componentDidUpdate(prevPros: IProps, prevState: IState) {
        if (prevState.coreLibraryId !== this.state.coreLibraryId) {
            await this.loadData();
        }
    }

    componentWillUnmount() {
        this.setState({
            coreLibraryId: null,
            changedLessons: [],
        });
    }

    loadData = async () => {
        this.setState({ isLoading: true });
        const { coreLibraryId } = this.state;
        const { success, response } = await Api.call('GET', `/core/chapters/core/${coreLibraryId}`);

        if (success) {
            this.allLessons = new Set();

            // @ts-ignore
            response.chapters.map((chapter: any) => (this[`ref-${chapter._id}`] = React.createRef()));

            this.setState({
                chapters: response.chapters,
                isLoading: false,
            });
        }
    };

    handleSelectAll = (e: any) => {
        if (e.target.checked) {
            this.setState({
                checkedChapters: new Set(this.state.chapters.map((chapter) => chapter._id)),
                checkedLessons: new Set(this.allLessons),
                changedLessons: this.state.chapters.map((chap) => ({
                    chapterId: chap?._id,
                    lessons: chap.lessons.map((lsn: any) => lsn?._id),
                })),
            });
        } else {
            this.setState({
                checkedChapters: new Set(),
                checkedLessons: new Set(),
                changedLessons: [],
            });
        }
    };

    handleChapterCheck = (e: any, chapterId: string) => {
        const { checkedChapters, checkedLessons } = this.state,
            chapter = e.target;
        let lessons = chapter.parentElement.parentElement.querySelectorAll('input[type="checkbox"][name^="lesson"]');

        if (lessons.length) {
            lessons = [...lessons];
        }

        if (chapter.checked) {
            checkedChapters.add(chapter.dataset.id);
            if (lessons.length) {
                lessons?.map((lesson: any) => checkedLessons.add(lesson.dataset.id));
            }
        } else {
            checkedChapters.delete(chapter.dataset.id);
            lessons.map((lesson: any) => checkedLessons.delete(lesson.dataset.id));
        }

        const allChapters = [...this.state.changedLessons];
        const chapterIndex = this.state.changedLessons.findIndex((chap) => chap?.chapterId === chapterId);

        if (chapter.checked) {
            const thisChapterData: any = this.state.chapters.find((chap) => chap?._id === chapterId);
            const newChapterData = {
                chapterId,
                lessons: thisChapterData.lessons.map((lsn: any) => lsn?._id),
            };
            console.log('newChapterData', newChapterData);
            if (Number(chapterIndex) >= 0) {
                allChapters.splice(Number(chapterIndex), 1, newChapterData);
            } else {
                allChapters.push(newChapterData);
            }
        } else {
            allChapters.splice(chapterIndex, 1);
        }

        this.setState({
            checkedChapters,
            checkedLessons,
            changedLessons: allChapters,
        });
    };

    handleLessonCheck = (e: any, lessonId: string, chapterId: string) => {
        const { checkedLessons } = this.state,
            lesson = e.target;

        if (lesson.checked) {
            checkedLessons.add(lesson.dataset.id);
        } else {
            checkedLessons.delete(lesson.dataset.id);
        }

        const newChangedLessons = [...this.state.changedLessons];
        const chapterIndex = this.state.changedLessons.findIndex((chap) => chap?.chapterId === chapterId);
        const checkedChapterLessons = Number(chapterIndex) >= 0 ? this.state.changedLessons[chapterIndex]?.lessons : [];

        if (lesson.checked) {
            checkedChapterLessons.push(lessonId);
        } else {
            const lessonIndex = this.state.changedLessons[chapterIndex]?.lessons.findIndex((lsn) => lsn === lessonId);
            checkedChapterLessons.splice(lessonIndex, 1);
        }

        const checkedValues = {
            chapterId,
            lessons: checkedChapterLessons,
        };

        if (newChangedLessons.map((lsn) => lsn.chapterId).includes(chapterId)) {
            newChangedLessons.splice(chapterIndex, 1, checkedValues);
        } else {
            newChangedLessons.push(checkedValues);
        }

        this.setState({
            checkedLessons,
            changedLessons: newChangedLessons,
        });
    };

    submitAction = async () => {
        if (this.state.isCreatedAsStatic) {
            const { success, response, message } = await Api.call('POST', '/courses/lessons-core', {
                lessons: this.state.changedLessons,
                chapterId: this.props.courseChapterId,
                isCreatedAsStatic: true,
                menuIndex: this.props.numOfItems,
            });
            if (success) {
                this.props.setGlobalAlert({
                    type: 'success',
                    message: message,
                });
                this.props.loadData();
                this.props.closeManageModal();
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message,
                });
            }
        }
    };

    handleSubmit = async (e: any) => {
        e.preventDefault();
        this.submitAction();
    };

    scrollingParent = (node: any): any => {
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
        const { chapters, checkedChapters, checkedLessons, coreLibraryId } = this.state;

        if (this.state.isLoading) {
            return (
                <div>
                    <Spinner />
                </div>
            );
        }

        return (
            <>
                {coreLibraryId ? (
                    <div>
                        {chapters.length > 0 && (
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

                                    <label htmlFor={'isCreatedAsStatic'} style={{ marginLeft: 'auto' }}>
                                        <input
                                            type='checkbox'
                                            name='isCreatedAsStatic'
                                            checked={this.state.isCreatedAsStatic}
                                            onChange={(e) => {
                                                this.setState({ isCreatedAsStatic: e.target.checked });
                                            }}
                                        />
                                        Create as static copy
                                    </label>

                                    <Button
                                        className='bd'
                                        type='submit'
                                        disabled={checkedChapters.size === 0 && checkedLessons.size === 0}
                                    >
                                        Add Selected To Course
                                    </Button>
                                </div>

                                <Accordion className='table-tree' defaultActiveKey={''}>
                                    {chapters.map((chapter) => {
                                        return (
                                            <Card key={chapter._id}>
                                                <Card.Header>
                                                    <input
                                                        type='checkbox'
                                                        name={`chapter-${chapter._id}`}
                                                        data-id={chapter._id}
                                                        onChange={(e) => this.handleChapterCheck(e, chapter._id)}
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
                                                                    field: (row: any) => {
                                                                        this.allLessons.add(row._id);

                                                                        return (
                                                                            <input
                                                                                type='checkbox'
                                                                                name={`lesson-${row._id}`}
                                                                                data-id={row._id}
                                                                                onChange={(e) =>
                                                                                    this.handleLessonCheck(
                                                                                        e,
                                                                                        row._id,
                                                                                        chapter._id
                                                                                    )
                                                                                }
                                                                                checked={this.state.checkedLessons.has(
                                                                                    row._id
                                                                                )}
                                                                            />
                                                                        );
                                                                    },
                                                                    maxWidth: '1.5rem',
                                                                },
                                                                {
                                                                    text: 'Lesson Name',
                                                                    field: (row: any) => (
                                                                        <>
                                                                            <OverlayTrigger
                                                                                placement='right'
                                                                                overlay={
                                                                                    <Tooltip id={`ltt-${row._id}`}>
                                                                                        {row.title}
                                                                                    </Tooltip>
                                                                                }
                                                                            >
                                                                                <span>{row.title}</span>
                                                                            </OverlayTrigger>
                                                                        </>
                                                                    ),
                                                                    minWidth: '20rem',
                                                                    className: 'limitTitle',
                                                                },
                                                                {
                                                                    text: 'Progress Time',
                                                                    field: 'maxTime',
                                                                },
                                                                {
                                                                    text: 'Required Time',
                                                                    field: 'requiredTime',
                                                                },
                                                                {
                                                                    text: 'Next Lesson Unlock',
                                                                    field: 'unlockNextLesson',
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
                        )}
                    </div>
                ) : (
                    <div className='mt-2'>
                        <ApiTable
                            basePath='/admin/core-library'
                            apiCall={{
                                method: 'GET',
                                path: '/core',
                            }}
                            columns={[
                                {
                                    text: 'Folder',
                                    field: 'title',
                                    minWidth: '35%',
                                    sortKey: 'title',
                                },
                                {
                                    text: 'Last modified',
                                    sortKey: 'updatedAt',
                                    field: (row: any) => new Date(row.updatedAt).toLocaleString('en-US'),
                                },
                                {
                                    text: 'Date created',
                                    sortKey: 'createdAt',
                                    field: (row: any) => new Date(row.createdAt).toLocaleString('en-US'),
                                },
                            ]}
                            rowButtons={[
                                {
                                    type: 'button',
                                    text: 'Select Folder',
                                    icon: faCheck,
                                    clickCallback: (e: any, doc: any, reload: any) => {
                                        this.setState({
                                            coreLibraryId: doc._id,
                                        });
                                    },
                                },
                            ]}
                        />
                    </div>
                )}
            </>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload: any) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(CoreLibraryContent);
