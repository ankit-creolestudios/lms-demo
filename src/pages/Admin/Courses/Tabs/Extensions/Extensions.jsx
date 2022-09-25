import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Table } from '../../../../../components/Table';
import apiCall from '../../../../../helpers/apiCall';
import { Link } from 'react-router-dom';
import { ConfirmationModal } from '../../../../../components/ConfirmationModal';
import { Col, Row, Form, FormGroup, Button, OverlayTrigger, Tooltip, ButtonGroup, Modal } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { Spinner } from '../../../../../components/Spinner';
import { Api, EventBus } from 'src/helpers/new';

class Extensions extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.docId = this.props.match.params.courseId;

        this.state = {
            course: {
                offerConditions: {
                    certificateExpiry: 'none',
                    expiry: 'none',
                    fail: 'none',
                    pass: 'none',
                },
            },
            isDirty: false,
            loading: false,
            showModal: false,
            modelMessage: '',
        };
    }

    componentDidMount = async () => {
        this._isMounted = true;
        this.createButtons();
        const { success, response } = await Api.call('GET', `/courses/${this.props.match.params.courseId}`);

        this.setState({
            course: {
                ...this.state.course,
                ...response,
            },
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

    toggleSpinner = () => {
        this.setState({
            loading: !this.state.loading,
        });
    };

    handleChange = (event) => {
        const value =
            parseInt(event.target.value).toString() === 'NaN'
                ? !!event.target.value
                    ? event.target.value
                    : ''
                : Math.max(0, Math.min(9999999999, Number(event.target.value)));

        this.setState({
            isDirty: true,
            course: {
                ...this.state.course,
                [event.target.name]: value,
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
        await this.submit();
    };

    submit = async () => {
        if (
            Object.values(this.state.course?.offerConditions).includes('extension') &&
            this.state.course?.offerOptions.extension.length === 0
        ) {
            EventBus.dispatch('toast', {
                type: 'warning',
                message: 'Please add at least one extension time and price to continue.',
            });
            return;
        }
        this.toggleSpinner();

        const newOfferCondition = Object.entries(this.state.course?.offerConditions)
            .map((data) => {
                return {
                    [data?.[0]]: data?.[1] === 'none' ? null : data?.[1],
                };
            })
            .reduce(
                (prev, current) => ({
                    ...prev,
                    ...current,
                }),
                {}
            );

        const { success, response, message } = await Api.call('PUT', `/courses/${this.docId}`, {
            extensionLimit: this.state.course.extensionLimit,
            offerOptions: this.state.course.offerOptions,
            offerConditions: newOfferCondition,
            repurchase: this.state.course.repurchase,
        });

        this.setIsDirty(false);
        if (success && response) {
            this.doRedirect(response._id, message);
        } else {
            this.toggleSpinner();
        }
    };

    doRedirect = (courseId, message) => {
        this.toggleSpinner();

        EventBus.dispatch('toast', {
            type: 'success',
            message: message ?? `Course has been updated`,
        });
    };

    addNew = (table) => {
        let course = this.state.course;
        if (!course.offerOptions) {
            course.offerOptions = { extension: [], repurchase: [] };
        }
        if (course.offerOptions[table].length === 3) {
            this.setState({
                showModal: true,
                modelMessage: `Maximum limit reached for Extension`,
            });
            return;
        }
        (course.offerOptions[table] = course.offerOptions[table] || []).push({ time: 0, price: 0 });
        this.setState({
            isDirty: true,
            course: course,
        });
    };

    hanldeTableChange = (table, field, index, value) => {
        let course = this.state.course;
        const mainValue = Math.max(0, Math.min(9999999999, Number(value)));
        course.offerOptions[table][index][field] = mainValue;
        this.setState({
            isDirty: true,
            course,
        });
    };

    hanldeOfferConditionChange = ({ target }) => {
        let course = this.state.course;
        if (!course.offerConditions) {
            course.offerConditions = { pass: 'none', fail: 'none', expiry: 'none', certificateExpiry: 'none' };
        }
        course.offerConditions[target.name] = target.value;
        this.setState({
            isDirty: true,
            course,
        });
    };
    deleteExensionRow(targetName, index) {
        const { course } = this.state;
        course.offerOptions[targetName].splice(index, 1);
        this.setState({
            isDirty: true,
            course,
        });
    }

    deleteExensionRow(targetName, index) {
        const { course } = this.state;
        course.offerOptions[targetName].splice(index, 1);
        this.setState({
            isDirty: true,
            course,
        });
    }

    render() {
        return this.state.loading ? (
            <Spinner />
        ) : (
            <div>
                <Form onSubmit={this.handleSubmit} id='examTableForm'>
                    <Row className='pt-5'>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <FormGroup>
                                <Form.Label htmlFor='extensionLimit'>Extension Limit</Form.Label>
                                <Form.Control
                                    type='number'
                                    id='extensionLimit'
                                    name='extensionLimit'
                                    value={
                                        typeof this.state.course.extensionLimit !== 'undefined'
                                            ? parseInt(this.state.course.extensionLimit)
                                            : ''
                                    }
                                    onChange={this.handleChange}
                                    placeholder='ꝏ'
                                />
                            </FormGroup>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Form.Label htmlFor='pass'>On Pass</Form.Label>
                            <Form.Control
                                as='select'
                                id='pass'
                                name='pass'
                                required
                                value={this.state.course?.offerConditions?.pass}
                                onChange={this.hanldeOfferConditionChange}
                            >
                                <option value='none'>None</option>
                                <option value='extension'>Extension</option>
                                <option value='repurchase'>Repurchase</option>
                            </Form.Control>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Form.Label htmlFor='fail'>On Fail</Form.Label>
                            <Form.Control
                                as='select'
                                id='fail'
                                name='fail'
                                required
                                value={this.state.course?.offerConditions?.fail}
                                onChange={this.hanldeOfferConditionChange}
                            >
                                <option value='none'>None</option>
                                <option value='repurchase'>Repurchase</option>
                            </Form.Control>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Form.Label htmlFor='certificateExpiry'>On Certificate Expiry</Form.Label>
                            <Form.Control
                                as='select'
                                id='certificateExpiry'
                                name='certificateExpiry'
                                required
                                value={this.state.course?.offerConditions?.certificateExpiry}
                                onChange={this.hanldeOfferConditionChange}
                            >
                                <option value='none'>None</option>
                                <option value='repurchase'>Repurchase</option>
                            </Form.Control>
                        </Col>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <Form.Label htmlFor='expiry'>On Expiry</Form.Label>
                            <Form.Control
                                as='select'
                                id='expiry'
                                name='expiry'
                                required
                                value={this.state.course?.offerConditions?.expiry}
                                onChange={this.hanldeOfferConditionChange}
                            >
                                <option value='none'>None</option>
                                <option value='extension'>Extension</option>
                                <option value='repurchase'>Repurchase</option>
                            </Form.Control>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                            <FormGroup>
                                <Form.Label htmlFor='repurchase'>Repurchase</Form.Label>
                                <Form.Control
                                    type='number'
                                    id='repurchase'
                                    name='repurchase'
                                    value={
                                        typeof this.state.course.repurchase !== 'undefined'
                                            ? parseInt(this.state.course.repurchase)
                                            : ''
                                    }
                                    onChange={this.handleChange}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
                <Button
                    className='mb-3 mt-4 bp'
                    onClick={() => {
                        this.addNew('extension');
                    }}
                >
                    New Extension
                </Button>
                <Table
                    rows={this.state?.course?.offerOptions?.extension ?? []}
                    columns={[
                        {
                            text: 'Extension Time',
                            field: (row, index) => {
                                return (
                                    <input
                                        type='number'
                                        name='extension-time'
                                        id={`extension-time-${index}`}
                                        value={parseInt(row.time)}
                                        min={0}
                                        onChange={(e) => {
                                            this.hanldeTableChange('extension', 'time', index, e.target.value);
                                        }}
                                    />
                                );
                            },
                        },
                        {
                            text: 'Price',
                            field: (row, index) => {
                                return (
                                    <input
                                        type='number'
                                        name='extension-price'
                                        id={`extension-price-${index}`}
                                        value={parseInt(row.price)}
                                        min={0}
                                        onChange={(e) => {
                                            this.hanldeTableChange('extension', 'price', index, e.target.value);
                                        }}
                                    />
                                );
                            },
                        },
                        {
                            text: 'Action',
                            field: (row, index) => {
                                return (
                                    <i
                                        className='fa-solid fa-trash-can'
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            this.deleteExensionRow('extension', index);
                                        }}
                                    />
                                );
                            },
                            maxWidth: '80px',
                            minWidth: '80px',
                        },
                    ]}
                />
                <Modal
                    style={{ justifyContent: 'center' }}
                    show={this.state.showModal}
                    onHide={this.handleHideModal}
                    fullscreen={'md-down'}
                >
                    <Modal.Body>{this.state.modelMessage}</Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant='primary'
                            onClick={() =>
                                this.setState({
                                    showModal: false,
                                })
                            }
                        >
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
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
)(withRouter(Extensions));
