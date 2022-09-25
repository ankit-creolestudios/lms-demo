import React, { Component, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import {
    Row,
    Col,
    Accordion,
    Card,
    Button,
    FormGroup,
    Form,
    OverlayTrigger,
    Tooltip,
    AccordionContext,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTrashAlt,
    faTimes,
    faEdit,
    faUnlink,
    faEllipsisV,
    faExternalLinkAlt,
    faCaretDown,
    faCaretUp,
    faCheck,
    faPencilAlt,
} from '@fortawesome/free-solid-svg-icons';
import { faClone as farClone } from '@fortawesome/free-regular-svg-icons';
import ContentItems from './ContentItems';
import apiCall from '../../helpers/apiCall';
import { ConfirmationModal } from '../ConfirmationModal';
import Select from 'react-select';
import EventBus from '../../helpers/eventBus';

function CaretToggle() {
    const currentEventKey = useContext(AccordionContext);

    return (
        <Button variant='link' type='button' className='float-right ml-1'>
            <FontAwesomeIcon icon={currentEventKey ? faCaretUp : faCaretDown} />
        </Button>
    );
}

class ItemCard extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        const typeTitle = props.type[0].toUpperCase() + props.type.substr(1).toLowerCase();

        let item = props.item;

        if (['course', 'package'].indexOf(this.props.type) >= 0) {
            item = null;
        }

        this.state = {
            item,
            submittedDocId: null,
            typeTitle,
            modalShow: false,
            totalMaxTime: 0,
            totalRequiredTime: 0,
            editable: {
                title: false,
                maxTime: false,
                requiredTime: false,
            },
            conditionStatementOpts: [],
        };
    }

    componentDidMount = async () => {
        this._isMounted = true;

        const conditionStatementMap = {
            ANY_TIME: `Start ${this.props.type} at any time`,
            PREVIOUS_STARTED: `Cannot start until previous ${this.props.type} started`,
            PREVIOUS_COMPLETED: `Cannot start until previous ${this.props.type} completed`,
            PREVIOUS_PASSED: `Cannot start until previous ${this.props.type} passed`,
            PROMPT_STARTED: `Prompt if started before previous ${this.props.type} started`,
            PROMPT_COMPLETED: `Prompt if started before previous ${this.props.type} completed`,
            PROMPT_PASSED: `Prompt if started before previous ${this.props.type} passed`,

            ALWAYS_UNLOCKED: 'All time',
            ON_LESSON_START: 'When started',
            REQUIRED_TIME_MET: 'When Timer Met',
            ON_QUIZ_START: 'When Quiz Started',
            ON_QUIZ_END: 'When Quiz Finished',
            ON_QUIZ_PASS: 'When Quiz Passed',
        };

        let conditions = [];
        if (this.props.type === 'lesson') {
            conditions = [
                'ALWAYS_UNLOCKED',
                'ON_LESSON_START',
                'REQUIRED_TIME_MET',
                'ON_QUIZ_START',
                'ON_QUIZ_END',
                'ON_QUIZ_PASS',
            ];
        } else if (this.props.type === 'course') {
            conditions = [
                'ANY_TIME',
                'PREVIOUS_STARTED',
                'PREVIOUS_COMPLETED',
                'PREVIOUS_PASSED',
                'PROMPT_STARTED',
                'PROMPT_COMPLETED',
                'PROMPT_PASSED',
            ];
        }

        conditions = conditions.map((condition) => {
            return {
                value: condition,
                label: conditionStatementMap[condition],
            };
        });

        if (['course', 'package'].indexOf(this.props.type) >= 0) {
            let url;
            if (this.props.type === 'course') {
                url = `/courses/${this.props.item.courseId}`;
            } else {
                url = `/packages/${this.props.item}`;
            }
            const { success, response } = await apiCall('GET', url);

            if (success && this._isMounted) {
                this.setState({
                    item: {
                        ...this.props.item,
                        ...this.state.item,
                        ...response,
                    },
                });
            }
        } else {
            this.setState({
                item: this.props.item,
            });
        }

        if (this._isMounted) {
            this.setState({
                conditionStatementOpts: conditions,
            });
        }

        EventBus.on('CourseForm-select-all-lessons', () => {
            this.props.selectLesson(this.props.item._id);
        });
    };

    componentWillUnmount = async () => {
        this._isMounted = false;
    };

    submit = async (individualField) => {
        let item = {
            ...this.state.item,
            _id: undefined,
            menuIndex: this.props.itemIdx,
        };

        if (this.props.source === 'courses') {
            item[(this.props.type === 'chapter' ? 'course' : 'chapter') + 'Id'] = this.props.parentDocId;
        } else if (this.props.source === 'core') {
            item[(this.props.type === 'chapter' ? 'coreLibrary' : 'coreChapter') + 'Id'] = this.props.parentDocId;
        }

        if (this.props.source === 'courses' && this.props.type === 'chapter' && this.state.item.coreChaptersLink) {
            if (this.props.item.title !== this.state.item.title) {
                item.titleModified = true;
            }
            if (this.props.item.chapterTime !== this.state.item.chapterTime) {
                item.chapterTimeModified = true;
            }

            if (this.props.item.title === this.state.item.title && !this.props.item.titleModified) {
                item.title = '';
            }
            if (this.props.item.chapterTime === this.state.item.chapterTime && !this.props.item.chapterTimeModified) {
                item.chapterTime = 0;
            }
        }

        let method = this.state.item.isNew ? 'POST' : 'PUT';

        if (
            this.props.source === 'courses' &&
            this.props.type === 'lesson' &&
            !this.props.parentsCoreLink &&
            this.state.item.coreChapterId
        ) {
            method = 'POST';
            item.conditionStatement = 'ALWAYS_UNLOCKED';
            item._id = undefined;
            item.chapterId = this.props.parentDocId;
        }

        let url = `/${this.props.source}/${this.props.type}s/`;
        if (method === 'PUT') {
            url += this.props.item._id;
        }

        if (this.props.type === 'lesson' && !this.state.item.isNew) {
            item = {
                ...item.draft,
                chapterId: item.chapterId,
                menuIndex: item.menuIndex,
                conditionStatement: item.conditionStatement,
                coreLessonsLink: item.coreLessonsLink || '',
            };
            delete item.updatedAt;
        }

        delete item.ref;
        delete item.draggableId;

        const { success, response } = await apiCall(method, url, item);

        if (this._isMounted && success && response) {
            this.setState({
                submittedDocId: this.props.item.isNew ? response._id : this.props.item._id,
            });
            if (individualField) {
                this.setState({
                    editable: {
                        ...this.state.editable,
                        [individualField]: false,
                    },
                    item: {
                        ...this.props.item,
                        ...this.state.item,
                        ...response,
                        isNew: false,
                    },
                });
            }
            this.props.updateRegister(this.state.item, 'submitted');
        } else {
            if (!individualField) {
                this.props.updateRegister(this.state.item, 'error');
            }
        }
    };

    submitField = async (field, value = null) => {
        const { success, response } = await apiCall('PATCH', '/courses/lessons/' + this.props.item._id, {
            [field]: value ? value : this.state.item[field],
        });
        if (success) {
            this.setState({
                editable: {
                    ...this.state.editable,
                    [field]: false,
                },
                item: {
                    ...this.props.item,
                    ...this.state.item,
                    ...response,
                    isNew: false,
                },
            });
        }
    };

    componentDidUpdate = (prevProps, prevState, snapshot) => {
        if (!prevProps.doSubmit && this.props.doSubmit && !this.state.submittedDocId) {
            this.submit();
        }

        if (prevProps.parentsCoreLink && !this.props.parentsCoreLink) {
            this.props.updateRegister(this.state.item, 'add', this.props.parentDocId);
        }
    };

    duplicateItem = () => {
        this.props.cloneItem(this.props.item);
    };

    handleChange = (prop, value) => {
        if (this.state.item) {
            let updatedItem = {
                ...this.state.item,
                [prop]: value,
            };

            this.setState({
                item: updatedItem,
            });
            if (this.props.updateStateItem) {
                this.props.updateStateItem(updatedItem);
            }
            if (this.props.setIsDirty) {
                this.props.setIsDirty(true);
            }
        }
    };

    updateTime = (totalMaxTime, totalRequiredTime) => {
        this.setState({
            totalMaxTime,
            totalRequiredTime,
        });
        if (this.props.updateMasterTime) {
            this.props.updateMasterTime(this.state.item, totalMaxTime, totalRequiredTime);
        }
    };

    get lessonTitle() {
        const {
            state: { item },
            props: { type },
        } = this;

        if (item && type === 'lesson') {
            return item.title;
        }
        return '';
    }

    get lessonProgressTime() {
        const {
            state: { item },
            props: { type },
        } = this;

        if (item && type === 'lesson') {
            return item.maxTime;
        }

        return 0;
    }

    get lessonRequiredTime() {
        const {
            state: { item },
            props: { type },
        } = this;

        if (item && type === 'lesson') {
            return item.requiredTime;
        }

        return 0;
    }

    render() {
        return (
            <>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    confirmAction={this.deleteQuiz}
                    titleText={'Are you sure?'}
                    bodyText={[`You are about to delete this Quiz.`]}
                />
                {this.renderAs(this.props.type === 'lesson' ? 'tableRow' : 'card')}
            </>
        );
    }

    renderAs = (what) => {
        let editItemLinkTarget;
        if (this.props.type === 'course') {
            editItemLinkTarget = `/admin/courses/${this.props.item.courseId}`;
        } else if (this.props.type === 'package') {
            editItemLinkTarget = `/admin/packages/edit/${this.props.item}`;
        } else if (this.props.type === 'lesson') {
            if (this.state.item.coreLessonsLink) {
                editItemLinkTarget = `/admin/core-library/lessons/edit/${this.state.item.coreLessonsLink}`;
            } else if (this.props.source === 'courses') {
                editItemLinkTarget = `/admin/courses/${this.props.match.params.id}/chapters/${this.state.item.chapterId}/lessons/${this.state.item._id}`;
            } else {
                editItemLinkTarget = `/admin/core-library/lessons/edit/${this.state.item._id}`;
            }
        }

        let editItemLinkIcon = faExternalLinkAlt;

        if (this.props.source !== 'packages' && this.state.item && !this.state.item[this.props.coreKey]) {
            editItemLinkIcon = faEdit;
        }

        let totalGuideHours = Math.floor(this.state.totalMaxTime / 60);
        let totalGuideMinutes = this.state.totalMaxTime - totalGuideHours * 60;

        let totalRequiredHours = Math.floor(this.state.totalRequiredTime / 60);
        let totalRequiredMinutes = this.state.totalRequiredTime - totalRequiredHours * 60;

        if (what === 'tableRow') {
            return [
                <div className='col col--center' key={`col--1`} style={{ maxWidth: '45px' }}>
                    {!this.props.parentsCoreLink && (
                        <span
                            {...this.props.dragHandleProps}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}>
                            <FontAwesomeIcon icon={faEllipsisV} />
                        </span>
                    )}
                    {/* <input type='checkbox'></input> */}
                </div>,
                <div className='col' style={{ minWidth: '30%' }} key={`col--2`}>
                    {this.state.editable.title ? (
                        <Form.Control
                            style={{
                                width: '86%',
                            }}
                            className='d-inline-block'
                            type='text'
                            required
                            minLength='3'
                            maxLength='512'
                            name='title'
                            value={this.lessonTitle || ''}
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            onChange={(event) => {
                                this.handleChange('title', event.target.value);
                            }}
                        />
                    ) : (
                        this.lessonTitle
                    )}
                    {this.state.editable.title ? (
                        <button
                            type='button'
                            className='btn bp ml-2'
                            onClick={(event) => {
                                event.stopPropagation();
                                this.submitField('title');
                            }}>
                            <FontAwesomeIcon icon={faCheck} />
                        </button>
                    ) : (
                        <FontAwesomeIcon
                            onClick={(event) => {
                                event.stopPropagation();
                                this.setState({
                                    editable: {
                                        ...this.state.editable,
                                        title: true,
                                    },
                                });
                            }}
                            style={{
                                cursor: 'pointer',
                                fontSize: '14px',
                                marginLeft: '7px',
                            }}
                            icon={faPencilAlt}
                        />
                    )}
                </div>,
                <div className='col' key={`col--3`}>
                    <div
                        className='d-inline-block'
                        style={{
                            textAlign: 'left',
                        }}>
                        {this.state.editable.maxTime ? (
                            <Form.Control
                                style={{
                                    width: '50%',
                                }}
                                className='d-inline-block'
                                type='number'
                                id='guideTime'
                                name='guideTime'
                                min='0'
                                value={this.lessonProgressTime || 0}
                                onChange={(event) => {
                                    this.handleChange('maxTime', event.target.value);
                                }}></Form.Control>
                        ) : (
                            this.lessonProgressTime
                        )}
                        {this.state.editable.maxTime ? (
                            <button
                                type='button'
                                className='btn bp ml-2'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.submitField('maxTime');
                                }}>
                                <FontAwesomeIcon icon={faCheck} />
                            </button>
                        ) : (
                            <FontAwesomeIcon
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.setState({
                                        editable: {
                                            ...this.state.editable,
                                            maxTime: true,
                                        },
                                    });
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
                </div>,
                <div className='col' key={`col--4`}>
                    <div
                        className='d-inline-block'
                        style={{
                            textAlign: 'left',
                        }}>
                        {this.state.editable.requiredTime ? (
                            <Form.Control
                                style={{
                                    width: '50%',
                                }}
                                className='d-inline-block'
                                type='number'
                                id='requiredTime'
                                name='requiredTime'
                                min='0'
                                value={this.lessonRequiredTime || 0}
                                onChange={(event) => {
                                    this.handleChange('requiredTime', event.target.value);
                                }}></Form.Control>
                        ) : (
                            this.lessonRequiredTime
                        )}
                        {this.state.editable.requiredTime ? (
                            <button
                                type='button'
                                className='btn bp ml-2'
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.submitField('requiredTime');
                                }}>
                                <FontAwesomeIcon icon={faCheck} />
                            </button>
                        ) : (
                            <FontAwesomeIcon
                                onClick={(event) => {
                                    event.stopPropagation();
                                    this.setState({
                                        editable: {
                                            ...this.state.editable,
                                            requiredTime: true,
                                        },
                                    });
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
                </div>,
                <div className='col' style={{ minWidth: '20%' }} key={`col--5`}>
                    <Select
                        name='conditionStatement'
                        defaultValue={this.state.item ? this.state.item.unlockNextLesson : 'ALWAYS_UNLOCKED'}
                        value={
                            this.state.conditionStatementOpts.filter((opt) => {
                                return this.state.item && opt.value === this.state.item.unlockNextLesson;
                            })[0]
                        }
                        options={this.state.conditionStatementOpts}
                        menuPortalTarget={document.body}
                        menuPosition={'fixed'}
                        styles={{
                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                        }}
                        closeMenuOnScroll={event => {
                            return event.target.id === 'mainContainerId';
                        }}
                        onChange={(event) => {
                            this.submitField('unlockNextLesson', event.value);
                            let tempItem = this.state.item;
                            tempItem.unlockNextLesson = event.value;
                            this.setState({ item: tempItem });
                        }}></Select>
                </div>,
                <div className='col' key={`col--6`}>
                    {this.props.type != 'lesson' || !this.props.parentsCoreLink ? (
                        <div>
                            {this.props.source !== 'packages' && this.props.type !== 'lesson' ? (
                                <CaretToggle />
                            ) : this.props.type !== 'package' ? (
                                <OverlayTrigger
                                    key={`tooltip-edit-${this.props.itemIdx}`}
                                    placement='top'
                                    overlay={
                                        <Tooltip id={`tooltip-edit-${this.props.itemIdx}`}>
                                            {this.props.source !== 'packages' && this.state.item.isNew
                                                ? `To edit this ${this.state.typeTitle} save the form first`
                                                : 'Edit'}
                                        </Tooltip>
                                    }>
                                    <span className='d-inline-block float-right'>
                                        {this.props.source !== 'packages' && this.state.item.isNew ? (
                                            <Button
                                                variant='link'
                                                style={{
                                                    pointerEvents: 'none',
                                                }}
                                                disabled
                                                className='btn ml-1'>
                                                <FontAwesomeIcon icon={editItemLinkIcon}></FontAwesomeIcon>
                                            </Button>
                                        ) : (
                                            <Link className='btn float-right ml-1' to={editItemLinkTarget}>
                                                <FontAwesomeIcon icon={editItemLinkIcon} />
                                            </Link>
                                        )}
                                    </span>
                                </OverlayTrigger>
                            ) : (
                                <></>
                            )}

                            {this.props.type === 'chapter' ||
                            (this.props.type === 'lesson' && !this.props.parentsCoreLink) ? (
                                <OverlayTrigger
                                    key={`tooltip-clone-${this.props.itemIdx}`}
                                    placement='top'
                                    overlay={
                                        <Tooltip id={`tooltip-clone-${this.props.itemIdx}`}>
                                            {this.state.item.isNew
                                                ? `To duplicate this ${this.state.typeTitle} save the form first`
                                                : 'Duplicate'}
                                        </Tooltip>
                                    }>
                                    <span className='d-inline-block float-right'>
                                        <Button
                                            variant='link'
                                            type='button'
                                            className='float-right ml-1'
                                            disabled={this.state.item.isNew}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.props.cloneItem(this.props.item);
                                            }}>
                                            <FontAwesomeIcon icon={farClone} />
                                        </Button>
                                    </span>
                                </OverlayTrigger>
                            ) : (
                                <></>
                            )}

                            <OverlayTrigger
                                key={`tooltip-delete-${this.props.itemIdx}`}
                                placement='top'
                                overlay={
                                    <Tooltip id={`tooltip-delete-${this.props.itemIdx}`}>
                                        {this.props.type === 'course' || this.props.type === 'package'
                                            ? 'Remove'
                                            : 'Delete'}
                                    </Tooltip>
                                }>
                                <Button
                                    variant='link'
                                    type='button'
                                    className='float-right ml-1'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.props.deleteItem(this.props.item);
                                    }}>
                                    <FontAwesomeIcon
                                        icon={
                                            this.props.type === 'course' || this.props.type === 'package'
                                                ? faTimes
                                                : faTrashAlt
                                        }
                                    />
                                </Button>
                            </OverlayTrigger>

                            {this.state.item && this.state.item[this.props.coreKey] ? (
                                [
                                    <OverlayTrigger
                                        key={`tooltip-unlink-${this.props.itemIdx}`}
                                        placement='top'
                                        overlay={
                                            <Tooltip id={`tooltip-unlink-${this.props.itemIdx}`}>
                                                Unlink from Core
                                            </Tooltip>
                                        }>
                                        <Button
                                            variant='link'
                                            type='button'
                                            className='float-right ml-1'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                this.props.unlinkItem(this.props.item);
                                            }}>
                                            <FontAwesomeIcon icon={faUnlink} />
                                        </Button>
                                    </OverlayTrigger>,
                                    this.props.type === 'chapter' ? (
                                        <OverlayTrigger
                                            key={`tooltip-edit-${this.props.itemIdx}`}
                                            placement='top'
                                            overlay={<Tooltip id={`tooltip-edit-${this.props.itemIdx}`}>Edit</Tooltip>}>
                                            <Link
                                                to={`/admin/core-library/edit/${this.state.item.coreLibraryId}?focus=${this.state.item.coreChaptersLink}`}
                                                className='btn float-right ml-1'>
                                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            </Link>
                                        </OverlayTrigger>
                                    ) : (
                                        <div key='dummyKey'></div>
                                    ),
                                ]
                            ) : (
                                <></>
                            )}
                        </div>
                    ) : (
                        <></>
                    )}
                </div>,
            ];
        } else {
            return (
                <Accordion defaultActiveKey={this.props.accordionOpen ? this.props.itemIdx + 1 : ''}>
                    <Card>
                        <Accordion.Toggle
                            style={
                                this.props.type === 'chapter'
                                    ? {
                                          backgroundColor: '#dcf5ee',
                                          fontWeight: 700,
                                      }
                                    : {}
                            }
                            as={Card.Header}
                            eventKey={this.props.itemIdx + 1}>
                            <Row>
                                <Col
                                    xs={12}
                                    lg={4}
                                    style={{
                                        paddingTop: '6px',
                                    }}
                                    className='my-2 my-lg-0'>
                                    {!this.props.parentsCoreLink && (
                                        <>
                                            <span
                                                {...this.props.dragHandleProps}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}>
                                                <FontAwesomeIcon
                                                    icon={faEllipsisV}
                                                    style={{
                                                        marginRight: '20px',
                                                    }}
                                                />
                                            </span>
                                            {this.props.type === 'chapter' ? (
                                                /*  <label className='mr-2'>
                                                    <input
                                                        type='checkbox'
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            // console.log(event);
                                                        }}></input>
                                                </label> */
                                                <></>
                                            ) : (
                                                <></>
                                            )}
                                        </>
                                    )}
                                    {this.props.source === 'packages' ? (
                                        <span style={{ marginRight: '10px' }}>
                                            {this.state.item ? this.state.item.title : ''}
                                        </span>
                                    ) : (
                                        <div
                                            className='d-inline-block'
                                            style={{
                                                width: '90%',
                                            }}>
                                            {this.state.editable.title ? (
                                                <Form.Control
                                                    style={{
                                                        width: '86%',
                                                    }}
                                                    className='d-inline-block'
                                                    type='text'
                                                    required
                                                    minLength='3'
                                                    maxLength='512'
                                                    name='title'
                                                    value={
                                                        this.state.item
                                                            ? this.props.type === 'lesson' && !this.state.item.isNew
                                                                ? this.state.item.draft.title
                                                                : this.state.item.title
                                                            : ''
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                    }}
                                                    onChange={(event) => {
                                                        this.handleChange('title', event.target.value);
                                                    }}
                                                />
                                            ) : this.state.item ? (
                                                this.props.type === 'lesson' && !this.state.item.isNew ? (
                                                    this.state.item.draft.title
                                                ) : (
                                                    this.state.item.title
                                                )
                                            ) : (
                                                ''
                                            )}
                                            {this.state.editable.title ? (
                                                <button
                                                    type='button'
                                                    className='btn bp ml-2'
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        this.submit('title');
                                                    }}>
                                                    <FontAwesomeIcon icon={faCheck} />
                                                </button>
                                            ) : (
                                                <FontAwesomeIcon
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        this.setState({
                                                            editable: {
                                                                ...this.state.editable,
                                                                title: true,
                                                            },
                                                        });
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
                                    )}
                                </Col>
                                <Col xs={12} lg={5} className='my-2 my-lg-0'>
                                    <Row>
                                        {this.props.source !== 'packages' ? (
                                            [
                                                <Col key='time-col-1' xs={12} lg={6} className='pt-2 text-right'>
                                                    <Form.Label htmlFor='guideTime' className='d-inline-block'>
                                                        Progress Time:&nbsp;
                                                    </Form.Label>
                                                    {this.props.type === 'lesson' ? (
                                                        <div
                                                            className='d-inline-block'
                                                            style={{
                                                                width: '50%',
                                                                textAlign: 'left',
                                                            }}>
                                                            {this.state.editable.maxTime ? (
                                                                <Form.Control
                                                                    style={{
                                                                        width: '50%',
                                                                    }}
                                                                    className='d-inline-block'
                                                                    type='number'
                                                                    id='guideTime'
                                                                    name='guideTime'
                                                                    min='0'
                                                                    value={
                                                                        this.state.item && this.state.item.isNew
                                                                            ? this.state.item.maxTime || ''
                                                                            : this.state.item && !this.state.item.isNew
                                                                            ? this.state.item.draft.maxTime || ''
                                                                            : ''
                                                                    }
                                                                    onChange={(event) => {
                                                                        this.handleChange(
                                                                            'maxTime',
                                                                            event.target.value
                                                                        );
                                                                    }}></Form.Control>
                                                            ) : this.state.item ? (
                                                                this.props.type === 'lesson' &&
                                                                !this.state.item.isNew ? (
                                                                    this.state.item.draft.maxTime
                                                                ) : (
                                                                    this.state.item.maxTime
                                                                )
                                                            ) : (
                                                                ''
                                                            )}
                                                            {this.state.editable.maxTime ? (
                                                                <button
                                                                    type='button'
                                                                    className='btn bp ml-2'
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        this.submit('maxTime');
                                                                    }}>
                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                </button>
                                                            ) : (
                                                                <FontAwesomeIcon
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        this.setState({
                                                                            editable: {
                                                                                ...this.state.editable,
                                                                                maxTime: true,
                                                                            },
                                                                        });
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
                                                    ) : (
                                                        <span
                                                            style={{
                                                                fontWeight: 'normal',
                                                            }}>
                                                            {`${totalGuideHours}h ${totalGuideMinutes}m`}
                                                        </span>
                                                    )}
                                                </Col>,
                                                <Col key='time-col-2' xs={12} lg={6} className='pt-2 text-right'>
                                                    <Form.Label htmlFor='requiredTime'>Required Time:&nbsp;</Form.Label>
                                                    {this.props.type === 'lesson' ? (
                                                        <div
                                                            className='d-inline-block'
                                                            style={{
                                                                width: '50%',
                                                                textAlign: 'left',
                                                            }}>
                                                            {this.state.editable.requiredTime ? (
                                                                <Form.Control
                                                                    style={{
                                                                        width: '50%',
                                                                    }}
                                                                    className='d-inline-block'
                                                                    type='number'
                                                                    id='requiredTime'
                                                                    name='requiredTime'
                                                                    min='0'
                                                                    value={
                                                                        this.state.item && this.state.item.isNew
                                                                            ? this.state.item.requiredTime || ''
                                                                            : this.state.item && !this.state.item.isNew
                                                                            ? this.state.item.draft.requiredTime || ''
                                                                            : ''
                                                                    }
                                                                    onChange={(event) => {
                                                                        this.handleChange(
                                                                            'requiredTime',
                                                                            event.target.value
                                                                        );
                                                                    }}></Form.Control>
                                                            ) : this.state.item ? (
                                                                this.props.type === 'lesson' &&
                                                                !this.state.item.isNew ? (
                                                                    this.state.item.draft.requiredTime
                                                                ) : (
                                                                    this.state.item.requiredTime
                                                                )
                                                            ) : (
                                                                ''
                                                            )}
                                                            {this.state.editable.requiredTime ? (
                                                                <button
                                                                    type='button'
                                                                    className='btn bp ml-2'
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        this.submit('requiredTime');
                                                                    }}>
                                                                    <FontAwesomeIcon icon={faCheck} />
                                                                </button>
                                                            ) : (
                                                                <FontAwesomeIcon
                                                                    onClick={(event) => {
                                                                        event.stopPropagation();
                                                                        this.setState({
                                                                            editable: {
                                                                                ...this.state.editable,
                                                                                requiredTime: true,
                                                                            },
                                                                        });
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
                                                    ) : (
                                                        <span
                                                            style={{
                                                                fontWeight: 'normal',
                                                            }}>
                                                            {`${totalRequiredHours}h ${totalRequiredMinutes}m`}
                                                        </span>
                                                    )}
                                                </Col>,
                                            ]
                                        ) : (
                                            <Col>
                                                {this.props.itemIdx > 0 ? (
                                                    <Select
                                                        name='conditionStatement'
                                                        defaultValue={
                                                            this.props.item
                                                                ? this.props.item.conditionStatement
                                                                : 'ANY_TIME'
                                                        }
                                                        value={
                                                            this.state.conditionStatementOpts.filter((opt) => {
                                                                return (
                                                                    this.props.item &&
                                                                    opt.value === this.props.item.conditionStatement
                                                                );
                                                            })[0]
                                                        }
                                                        options={this.state.conditionStatementOpts}
                                                        menuPortalTarget={document.body}
                                                        menuPosition={'fixed'}
                                                        onChange={(event) => {
                                                            const updatedItem = {
                                                                ...this.state.item,
                                                                conditionStatement: event.value,
                                                            };
                                                            if (this.props.updateItem) {
                                                                this.props.updateItem(updatedItem);
                                                            } else {
                                                                this.setState({
                                                                    item: updatedItem,
                                                                });
                                                            }
                                                            if (this.props.setIsDirty) {
                                                                this.props.setIsDirty(true);
                                                            }
                                                        }}></Select>
                                                ) : (
                                                    <></>
                                                )}
                                            </Col>
                                        )}
                                    </Row>
                                </Col>
                                <Col xs={12} lg={3} className='my-2 my-lg-0'>
                                    {this.props.type != 'lesson' || !this.props.parentsCoreLink ? (
                                        <div>
                                            {this.props.source !== 'packages' && this.props.type !== 'lesson' ? (
                                                <CaretToggle />
                                            ) : this.props.type !== 'package' ? (
                                                <OverlayTrigger
                                                    key={`tooltip-edit-${this.props.itemIdx}`}
                                                    placement='top'
                                                    overlay={
                                                        <Tooltip id={`tooltip-edit-${this.props.itemIdx}`}>
                                                            {this.props.source !== 'packages' && this.state.item.isNew
                                                                ? `To edit this ${this.state.typeTitle} save the form first`
                                                                : 'Edit'}
                                                        </Tooltip>
                                                    }>
                                                    <span className='d-inline-block float-right'>
                                                        {this.props.source !== 'packages' && this.state.item.isNew ? (
                                                            <Button
                                                                variant='link'
                                                                style={{
                                                                    pointerEvents: 'none',
                                                                }}
                                                                disabled
                                                                className='btn ml-1'>
                                                                <FontAwesomeIcon
                                                                    icon={editItemLinkIcon}></FontAwesomeIcon>
                                                            </Button>
                                                        ) : (
                                                            <Link
                                                                className='btn float-right ml-1'
                                                                to={editItemLinkTarget}>
                                                                <FontAwesomeIcon icon={editItemLinkIcon} />
                                                            </Link>
                                                        )}
                                                    </span>
                                                </OverlayTrigger>
                                            ) : (
                                                <></>
                                            )}
                                            {this.props.type === 'chapter' ||
                                            (this.props.type === 'lesson' && !this.props.parentsCoreLink) ? (
                                                <OverlayTrigger
                                                    key={`tooltip-clone-${this.props.itemIdx}`}
                                                    placement='top'
                                                    overlay={
                                                        <Tooltip id={`tooltip-clone-${this.props.itemIdx}`}>
                                                            {this.state.item.isNew
                                                                ? `To duplicate this ${this.state.typeTitle} save the form first`
                                                                : 'Duplicate'}
                                                        </Tooltip>
                                                    }>
                                                    <span className='d-inline-block float-right'>
                                                        <Button
                                                            variant='link'
                                                            type='button'
                                                            className='float-right ml-1'
                                                            disabled={this.state.item.isNew}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                this.props.cloneItem(this.props.item);
                                                            }}>
                                                            <FontAwesomeIcon icon={farClone} />
                                                        </Button>
                                                    </span>
                                                </OverlayTrigger>
                                            ) : (
                                                <></>
                                            )}
                                            <OverlayTrigger
                                                key={`tooltip-delete-${this.props.itemIdx}`}
                                                placement='top'
                                                overlay={
                                                    <Tooltip id={`tooltip-delete-${this.props.itemIdx}`}>
                                                        {this.props.type === 'course' || this.props.type === 'package'
                                                            ? 'Remove'
                                                            : 'Delete'}
                                                    </Tooltip>
                                                }>
                                                <Button
                                                    variant='link'
                                                    type='button'
                                                    className='float-right ml-1'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        this.props.deleteItem(this.props.item);
                                                    }}>
                                                    <FontAwesomeIcon
                                                        icon={
                                                            this.props.type === 'course' ||
                                                            this.props.type === 'package'
                                                                ? faTimes
                                                                : faTrashAlt
                                                        }
                                                    />
                                                </Button>
                                            </OverlayTrigger>

                                            {this.state.item && this.state.item[this.props.coreKey] ? (
                                                [
                                                    <OverlayTrigger
                                                        key={`tooltip-unlink-${this.props.itemIdx}`}
                                                        placement='top'
                                                        overlay={
                                                            <Tooltip id={`tooltip-unlink-${this.props.itemIdx}`}>
                                                                Unlink from Core
                                                            </Tooltip>
                                                        }>
                                                        <Button
                                                            variant='link'
                                                            type='button'
                                                            className='float-right ml-1'
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                this.props.unlinkItem(this.props.item);
                                                            }}>
                                                            <FontAwesomeIcon icon={faUnlink} />
                                                        </Button>
                                                    </OverlayTrigger>,
                                                    this.props.type === 'chapter' ? (
                                                        <OverlayTrigger
                                                            key={`tooltip-edit-${this.props.itemIdx}`}
                                                            placement='top'
                                                            overlay={
                                                                <Tooltip id={`tooltip-edit-${this.props.itemIdx}`}>
                                                                    Edit
                                                                </Tooltip>
                                                            }>
                                                            <Link
                                                                to={`/admin/core-library/edit/${this.state.item.coreLibraryId}?focus=${this.state.item.coreChaptersLink}`}
                                                                className='btn float-right ml-1'>
                                                                <FontAwesomeIcon icon={faExternalLinkAlt} />
                                                            </Link>
                                                        </OverlayTrigger>
                                                    ) : (
                                                        <div key='dummyKey'></div>
                                                    ),
                                                ]
                                            ) : (
                                                <></>
                                            )}
                                        </div>
                                    ) : (
                                        <></>
                                    )}
                                </Col>
                            </Row>
                        </Accordion.Toggle>

                        {this.props.type === 'chapter' ? (
                            <Accordion.Collapse eventKey={this.props.itemIdx + 1}>
                                <Card.Body>
                                    <Row>
                                        <Col>
                                            <FormGroup>
                                                <ContentItems
                                                    type='lesson'
                                                    source={this.props.source}
                                                    parentDocId={this.state.submittedDocId || this.props.item._id}
                                                    doSubmit={this.state.submittedDocId && this.props.doSubmit}
                                                    parentsCoreLink={
                                                        this.state.item ? this.state.item[this.props.coreKey] : null
                                                    }
                                                    setIsDirty={this.props.setIsDirty}
                                                    updateRegister={this.props.updateRegister}
                                                    updateTime={this.updateTime}
                                                />
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Accordion.Collapse>
                        ) : (
                            <></>
                        )}
                    </Card>
                </Accordion>
            );
        }
    };
}

export default withRouter(ItemCard);
