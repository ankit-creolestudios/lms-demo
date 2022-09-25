import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApiTable } from '../../../../../components/ApiTable';
import apiCall from '../../../../../helpers/apiCall';
import { ConfirmationModal } from '../../../../../components/ConfirmationModal';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faClone as farClone } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { Col, Row, Form, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { Spinner } from '../../../../../components/Spinner';

class ExamTable extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.docId = this.props.match.params.courseId;

        this.state = {
            course: {},
            isDirty: false,
            loading: false,
            modalShow: false,
            modalAction: null,
            modalType: '',
        };
    }

    componentDidMount = async () => {
        this._isMounted = true;
        this.createButtons();
        const { success, response } = await apiCall('GET', `/courses/${this.props.match.params.courseId}`);

        this.setState({
            course: response,
        });

        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.pushBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.isDirty !== prevState.isDirty) {
            this.createButtons();
        }
    }

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.removeBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
        window.socket.emit('remove user editing course', this.docId);
        this._isMounted = false;
        this.props.createFormActions({});
    };

    setIsDirty = (dirty) => {
        this.setState({
            isDirty: dirty,
        });
    };

    toggleSpinner = (show) => {
        this.setState({
            loading: !this.state.loading,
        });
    };

    duplicateExam = async (docId, reloadTable) => {
        const { success, message } = await apiCall('POST', `/courses/exams/${docId}/clone`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Exam has been duplicated',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Exam has not been duplicated. Please try again.',
            });
        }
    };

    deleteExam = async (docId, reloadTable) => {
        const { success, message } = await apiCall('DELETE', `/courses/exams/${docId}`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Exam has been deleted',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Exam has not been deleted. Please try again.',
            });
        }
    };

    handleChange = (event) => {
        this.setState({
            isDirty: true,
            course: {
                ...this.state.course,
                [event.target.name]: event.target.value,
            },
        });
    };

    createButtons = () => {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Save',
                    onClick: this.handleSubmit,
                    className: 'bp',
                    disabled: !this.state.isDirty,
                },
            ],
        });
    };

    handleSubmit = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setIsDirty(false);
        this.toggleSpinner();
        await this.submit();
    };

    submit = async () => {
        if (!this._isMounted) {
            return;
        }

        const { success, response, message } = await apiCall('PUT', `/courses/${this.docId}`, {
            minimumCompletionTime: this.state.course.minimumCompletionTime,
            attemptLimit: this.state.course.attemptLimit,
            attemptDelay: this.state.course.attemptDelay,
            randomExam: this.state.course.randomExam === 'true',
        });

        if (this._isMounted) {
            if (success && response) {
                this.doRedirect(response._id, message);
            } else {
                this.handleSubmitFailed(message);
            }
        }
    };

    doRedirect = (courseId, message) => {
        this.toggleSpinner();

        this.props.setGlobalAlert({
            type: 'success',
            message: message ?? `Course has been ${this.docId !== 'new' ? 'updated' : 'created'}`,
        });

        if (this.docId === 'new') {
            this.setState({
                redirect: `/admin/courses/${courseId}`,
            });
        }
    };

    handleSubmitFailed = () => {
        this.props.setGlobalAlert({
            type: 'error',
            message: message ?? 'There was a problem with saving this Course. Please try again',
        });
        this.toggleSpinner();
    };

    render() {
        return this.state.loading ? (
            <Spinner />
        ) : (
            <div>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    confirmAction={this.state.modalAction}
                    titleText={'Are you sure?'}
                    bodyText={[
                        'You are about to ',
                        <strong key='modal-type'>{this.state.modalType}</strong>,
                        ' this Exam.',
                    ]}
                />
                <Form onSubmit={this.handleSubmit} id='examTableForm'>
                    <Row className='pt-5'>
                        <Col md={3}>
                            <FormGroup>
                                <Form.Label>Randomize Exams?</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='randomExam'
                                    name='randomExam'
                                    required
                                    value={this.state.course.randomExam}
                                    onChange={this.handleChange}
                                >
                                    <option value='true'>Yes</option>
                                    <option value='false'>No</option>
                                </Form.Control>
                            </FormGroup>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
                            <FormGroup>
                                <Form.Label htmlFor='minimumCompletionTime'>Minimum Completion Time</Form.Label>
                                <Form.Control
                                    type='number'
                                    required
                                    min='0'
                                    id='minimumCompletionTime'
                                    name='minimumCompletionTime'
                                    value={this.state.course.minimumCompletionTime}
                                    onChange={this.handleChange}
                                    readOnly={this.props.handleQuizChange && !this.props.editable}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <FormGroup>
                                <Form.Label htmlFor='attemptLimit'>Attempt Limit</Form.Label>
                                <Form.Control
                                    type='number'
                                    required
                                    min='0'
                                    id='attemptLimit'
                                    name='attemptLimit'
                                    value={this.state.course.attemptLimit}
                                    onChange={this.handleChange}
                                    readOnly={this.props.handleQuizChange && !this.props.editable}
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={3}>
                            <FormGroup>
                                <Form.Label htmlFor='attemptDelay'>Attempt Delay (days)</Form.Label>
                                <Form.Control
                                    type='number'
                                    required
                                    min='0'
                                    id='attemptDelay'
                                    name='attemptDelay'
                                    value={this.state.course.attemptDelay}
                                    onChange={this.handleChange}
                                    readOnly={this.props.handleQuizChange && !this.props.editable}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
                <a className='btn bp btn--small' href={`/admin/courses/ext/${this.docId}/exams/create/`}>
                    New Exam
                </a>
                <ApiTable
                    apiCall={{
                        method: 'GET',
                        path: `/courses/${this.docId}/exams`,
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row) => (
                                <OverlayTrigger
                                    placement='top'
                                    overlay={<Tooltip id={`tooltip-${row._id}-edit-exam)}`}>Edit exam</Tooltip>}
                                >
                                    <Link className='btn btn--small' to={'/admin/courses/ext/exams/edit/' + row._id}>
                                        <Fa icon={faEdit} />
                                    </Link>
                                </OverlayTrigger>
                            ),
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Title',
                            field: 'title',
                            minWidth: '45%',
                        },
                        {
                            text: 'Created at',
                            field: 'createdAt',
                        },
                    ]}
                    rowButtons={[
                        {
                            type: 'button',
                            text: 'Duplicate exam',
                            icon: farClone,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.duplicateExam(doc._id, reload);
                                    },
                                    modalType: 'duplicate',
                                });
                            },
                        },
                        {
                            type: 'button',
                            text: 'Delete exam',
                            icon: faTrash,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.deleteExam(doc._id, reload);
                                    },
                                    modalType: 'delete',
                                });
                            },
                        },
                    ]}
                />
            </div>
        );
    }
}

export default connect(
    (state) => {
        return {
            formActions: state.formActions,
            loggedIn: state.loggedIn,
        };
    },
    {
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
    }
)(withRouter(ExamTable));
