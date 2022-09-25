import React, { Component, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import apiCall from '../../../helpers/apiCall';
import shortEnglishHumanizer from '../../../helpers/shortEnglishHumanizer';
import '../../../components/ApiTable/ApiTable.scss';
import {
    Card,
    Col,
    Form,
    Row,
    Button,
    Accordion,
    AccordionContext,
    Modal,
    OverlayTrigger,
    Tooltip,
} from 'react-bootstrap';
import { Spinner } from '../../../components/Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { InfoComments } from '../../../components/InfoComments';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import './UserPackages.scss';
import {
    faCaretDown,
    faCaretUp,
    faTrashAlt,
    faStopCircle,
    faPlayCircle,
    faPencilAlt,
    faCheck,
} from '@fortawesome/free-solid-svg-icons';
import UserProgress from './UserProgress';
import Table from '../../../components/Table/Table';
import { ConditionalWrapper } from '../../../components/ConditionalWrapper/ConditialWrapper';
import DatePicker from '../../../components/DatePicker/DatePicker';
import { Api, EventBus } from 'src/helpers/new';

function CaretToggle() {
    const currentEventKey = useContext(AccordionContext);

    return (
        <FontAwesomeIcon
            className='float-right'
            style={{
                fontSize: '20px',
            }}
            icon={currentEventKey ? faCaretUp : faCaretDown}
        />
    );
}

class UserPackages extends Component {
    state = {
        userPackages: [],
        availablePackages: [],
        selectedPackageId: '',
        loading: true,
        modalShow: false,
        modalAction: null,
        showRefundModal: false,
        refundAmount: 0,
        showPostRefundSuspendModal: false,
        showTransactionsModal: false,
        showSuspendPackageModal: false,
        showReactivatePackageModal: false,
        showManageModal: false,
        showSuspendCourseModal: false,
        showReactivateCourseModal: false,
        currentUserCourse: null,
        currentUserPackage: null,
        editExpiryDate: false,
    };

    formatDate = (date) => {
        return date ? new Date(date).toLocaleDateString('en-US') : '-';
    };

    loadPackages = async () => {
        this.setState({
            loading: true,
        });
        const { success: successPackages, response: responsePackages } = await Api.call(
                'GET',
                `/packages?perPage=all&publishedOnly=1`
            ),
            { success: successUserPckg, response: responseUserPckg } = await Api.call(
                'GET',
                `/users/${this.props.user._id}/packages?perPage=all`
            );

        let userPackages = [];

        if (successUserPckg && responseUserPckg.docs) {
            let courseRefreshed = false;
            userPackages = responseUserPckg.docs.map(async (userPackage) => {
                const { success, response } = await Api.call(
                    'GET',
                    `/users/${this.props.user._id}/packages/${userPackage._id}/courses`
                );

                if (success && response.courses && response.courses.length) {
                    userPackage.courses = response.courses;

                    if (this.state.currentUserCourse && !courseRefreshed) {
                        for (const course of response.courses) {
                            if (course._id === this.state.currentUserCourse._id) {
                                this.setState({
                                    currentUserCourse: course,
                                });
                                courseRefreshed = true;
                                break;
                            }
                        }
                    }
                }
                return userPackage;
            });
            userPackages = await Promise.all(userPackages);
        }

        this.setState({
            availablePackages: responsePackages.docs,
            userPackages,
            loading: false,
        });
    };

    componentDidMount = async () => {
        this.loadPackages();
    };

    selectPackage(event) {
        this.setState({
            selectedPackageId: event.target.value,
        });
    }

    addPackage = async (event) => {
        event.preventDefault();

        if (this.state.selectedPackageId) {
            this.setState({
                loading: true,
            });
            const { success, response, message } = await Api.call(
                'POST',
                `/users/${this.props.user._id}/packages/add/${this.state.selectedPackageId}`
            );

            if (success) {
                this.loadPackages();
                EventBus.dispatch('toast', {
                    type: 'success',
                    message: message ?? `Package has been added`,
                });
            }
        }
    };

    removeUserPackage = async (id) => {
        this.setState({
            loading: true,
        });

        const { success, message } = await Api.call('DELETE', `/users/${this.props.user._id}/packages/${id}`);

        if (success) {
            this.loadPackages();
            EventBus.dispatch('toast', {
                type: 'success',
                message: message ?? `Package has been deleted`,
            });
        } else {
            this.setState({
                loading: false,
            });
        }

        this.setState({
            modalShow: false,
        });
    };

    handleRefundChange = (event) => {
        this.setState({
            refundAmount: event.target.value,
        });
    };

    suspendUserPackage = async () => {
        const { success, response, message } = await Api.call(
            'POST',
            `/users/packages/${this.state.currentUserPackage._id}/suspend`
        );
        if (success) {
            EventBus.dispatch('toast', {
                type: 'success',
                message,
            });
            this.loadPackages();
        }
    };

    reactivateUserPackage = async () => {
        const { success, response } = await Api.call(
            'POST',
            `/users/packages/${this.state.currentUserPackage._id}/reactivate`
        );
        if (success) {
            this.loadPackages();
        }
    };

    suspendUserCourse = async () => {
        const { success, response } = await Api.call(
            'POST',
            `/users/courses/${this.state.currentUserCourse._id}/suspend`
        );
        if (success) {
            this.loadPackages();
        }
    };

    reactivateUserCourse = async () => {
        const { success, response } = await Api.call(
            'POST',
            `/users/courses/${this.state.currentUserCourse._id}/reactivate`
        );
        if (success) {
            this.loadPackages();
        }
    };

    saveExpiryDate = async () => {
        if (this.state.currentUserCourse.expiresAt) {
            const { success, response } = await Api.call(
                'PUT',
                `/users/courses/${this.state.currentUserCourse._id}/expiry`,
                {
                    date: this.state.currentUserCourse.expiresAt,
                }
            );
        }
    };

    handleCourseChange = (prop, event, value) => {
        const date = value ? value : event.target.value;
        let updatedCourse = {
            ...this.state.currentUserCourse,
            [prop]: date ? new Date(date).toISOString() : null,
        };

        let updatedPackages = this.state.userPackages.map((userPackage) => {
            let updatedCourses = userPackage.courses.map((userCourse) => {
                if (userCourse._id == this.state.currentUserCourse._id) {
                    return updatedCourse;
                }
                return userCourse;
            });
            userPackage.courses = updatedCourses;
            return userPackage;
        });

        this.setState({
            currentUserCourse: updatedCourse,
            userPackages: updatedPackages,
        });
    };

    closeManageModal = () => {
        this.setState({ showManageModal: false });
        window.socket.emit('clear admin editing');
    };

    resetUserPackage = async (id, packageId) => {
        this.setState({
            loading: true,
        });

        const { success, message } = await Api.call('PATCH', `/users/${this.props.user._id}/packages/${id}/reset`, {
            packageId,
        });

        if (success) {
            this.loadPackages();
            EventBus.dispatch('toast', {
                type: 'success',
                message: message ?? `Package has been reset`,
            });
        } else {
            this.setState({
                loading: false,
            });
        }
    };

    render() {
        if (this.state.loading) {
            return (
                <section>
                    <Spinner />
                </section>
            );
        } else {
            const totalHours = shortEnglishHumanizer(
                this.state.currentUserCourse?.lessons?.totalRequiredTime * 60_000,
                {
                    units: ['h'],
                    round: true,
                }
            );
            return (
                <section id='user-page__packages'>
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
                            <strong key='modal-type'>remove</strong>,
                            ' this Package Subscription.',
                        ]}
                    />
                    <Modal
                        enforceFocus={false}
                        dialogClassName='modal-90w admin-modal'
                        show={this.state.showManageModal}
                        onHide={this.closeManageModal}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header style={{ borderBottom: 'none' }}>
                            <div
                                className='d-flex align-items-center'
                                style={{
                                    width: '100%',
                                    marginRight: 0,
                                    marginLeft: 0,
                                }}
                            >
                                <div className='pl-2'>
                                    {this.state.currentUserCourse && this.state.currentUserCourse.title}
                                </div>
                                <div className='user-page__packages__user-data'>
                                    {this.props.user.firstName} {this.props.user.lastName} ({this.props.user.email})
                                </div>
                                {this.state.currentUserCourse && (
                                    <div>
                                        <InfoComments
                                            articleType='courses'
                                            articleId={this.state.currentUserCourse._id}
                                        />
                                    </div>
                                )}
                                <div className='pr-0' style={{ minWidth: '266px' }}>
                                    <Button
                                        variant='info'
                                        className='mx-1'
                                        onClick={() => {
                                            if (
                                                this.state.currentUserCourse &&
                                                this.state.currentUserCourse.suspendedAt
                                            ) {
                                                this.setState({
                                                    showReactivateCourseModal: true,
                                                });
                                            } else {
                                                this.setState({
                                                    showSuspendCourseModal: true,
                                                });
                                            }
                                        }}
                                    >
                                        <strong>
                                            {this.state.currentUserCourse && this.state.currentUserCourse.suspendedAt
                                                ? 'Reactivate Course'
                                                : 'Suspend Course'}
                                        </strong>
                                    </Button>
                                    <button type='button' className='btn bp mx-1' onClick={this.closeManageModal}>
                                        <strong>Close</strong>
                                    </button>
                                </div>
                            </div>
                        </Modal.Header>
                        <Modal.Body className='pt-0 pb-4 header-labels'>
                            <Row
                                style={{
                                    backgroundColor: '#fff',
                                    padding: '10px',
                                }}
                            >
                                <Col sm={2}>
                                    <div>
                                        <strong>Enrolled On: </strong>
                                    </div>
                                    <div>
                                        {this.state.currentUserCourse &&
                                        this.state.currentUserCourse.enrollmentUpdatedAt
                                            ? new Date(
                                                  this.state.currentUserCourse.enrollmentUpdatedAt
                                              ).toLocaleDateString('en-US')
                                            : '-'}
                                    </div>
                                </Col>
                                <Col
                                    sm={4}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    <div>
                                        <strong>Expiry Date:</strong>
                                    </div>
                                    <div
                                        style={{
                                            width: '70%',
                                            display: 'flex',
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        {this.state.editExpiryDate ? (
                                            <DatePicker
                                                id='expiresAt'
                                                handleDateChange={(prop, date) => {
                                                    this.handleCourseChange(prop, null, date);
                                                }}
                                                date={
                                                    this.state.currentUserCourse &&
                                                    this.state.currentUserCourse.expiresAt
                                                        ? this.state.currentUserCourse.expiresAt.split('T')[0]
                                                        : ''
                                                }
                                            />
                                        ) : (
                                            <span>
                                                {this.state.currentUserCourse && this.state.currentUserCourse.expiresAt
                                                    ? new Date(
                                                          this.state.currentUserCourse.expiresAt
                                                      ).toLocaleDateString('en-US')
                                                    : '-'}
                                            </span>
                                        )}

                                        {this.state.editExpiryDate ? (
                                            <button
                                                type='button'
                                                className='btn bp ml-1'
                                                onClick={() => {
                                                    this.setState({
                                                        editExpiryDate: false,
                                                    });
                                                    this.saveExpiryDate();
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                        ) : (
                                            <FontAwesomeIcon
                                                onClick={() => {
                                                    this.setState({
                                                        editExpiryDate: true,
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
                                </Col>
                                <Col sm={2}>
                                    <div>
                                        <strong>Progress: </strong>
                                    </div>
                                    {this.state.currentUserCourse && (
                                        <div>
                                            {this.state.currentUserCourse.percentageProgress}% of {totalHours}
                                        </div>
                                    )}
                                </Col>
                                <Col sm={2}>
                                    <div>
                                        <strong>Time Spent: </strong>
                                    </div>
                                    <div>
                                        {this.state.currentUserCourse?.lessons?.timeSpent
                                            ? shortEnglishHumanizer(this.state.currentUserCourse.lessons.timeSpent)
                                            : 'N/A'}
                                    </div>
                                </Col>
                                <Col sm={2}>
                                    <div>
                                        <strong>Completed On: </strong>
                                    </div>
                                    <div>
                                        {this.state.currentUserCourse && this.state.currentUserCourse.completedAt
                                            ? new Date(this.state.currentUserCourse.completedAt).toLocaleDateString(
                                                  'en-US'
                                              )
                                            : '-'}
                                    </div>
                                </Col>
                            </Row>
                            {this.state.currentUserCourse && (
                                <UserProgress course={this.state.currentUserCourse} userId={this.props.docId} />
                            )}
                        </Modal.Body>
                    </Modal>
                    <Modal
                        show={this.state.showTransactionsModal}
                        onHide={() => {
                            this.setState({ showTransactionsModal: false });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Transactions</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <p>
                                Here you will see a list of any financial transactions and links to any paperwork such
                                as invoices or refund receipts...
                            </p>
                        </Modal.Body>
                    </Modal>
                    <Modal
                        show={this.state.showSuspendPackageModal}
                        onHide={() => {
                            this.setState({ showSuspendPackageModal: false });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Suspend Student?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <p className='my-0'>Do you want to suspend Student without issuing a refund?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                onClick={() => {
                                    this.suspendUserPackage();
                                    this.setState({
                                        showSuspendPackageModal: false,
                                    });
                                }}
                            >
                                Suspend
                            </Button>
                            <Button
                                variant='primary'
                                onClick={() => {
                                    this.setState({
                                        showSuspendPackageModal: false,
                                        showRefundModal: true,
                                    });
                                }}
                            >
                                Refund
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        show={this.state.showSuspendCourseModal}
                        onHide={() => {
                            this.setState({ showSuspendCourseModal: false });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Suspend Student?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <p className='my-0'>Do you want to suspend Student from this Course?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                onClick={() => {
                                    this.suspendUserCourse();
                                    this.setState({
                                        showSuspendCourseModal: false,
                                    });
                                }}
                            >
                                Suspend
                            </Button>
                            <Button
                                variant='primary'
                                onClick={() => {
                                    this.setState({
                                        showSuspendCourseModal: false,
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        show={this.state.showReactivatePackageModal}
                        onHide={() => {
                            this.setState({
                                showReactivatePackageModal: false,
                            });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Reactivate Student?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <p className='my-0'>Do you want to reactivate Student Package?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                className='bd'
                                onClick={() => {
                                    this.setState({
                                        showReactivatePackageModal: false,
                                    });
                                }}
                            >
                                No
                            </Button>
                            <Button
                                variant='primary'
                                className='bp'
                                onClick={() => {
                                    this.reactivateUserPackage();
                                    this.setState({
                                        showReactivatePackageModal: false,
                                    });
                                }}
                            >
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        show={this.state.showReactivateCourseModal}
                        onHide={() => {
                            this.setState({
                                showReactivateCourseModal: false,
                            });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Reactivate Student?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <p className='my-0'>Do you want to reactivate Student Course?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                className='bd'
                                onClick={() => {
                                    this.setState({
                                        showReactivateCourseModal: false,
                                    });
                                }}
                            >
                                No
                            </Button>
                            <Button
                                variant='primary'
                                className='bp'
                                onClick={() => {
                                    this.reactivateUserCourse();
                                    this.setState({
                                        showReactivateCourseModal: false,
                                    });
                                }}
                            >
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        show={this.state.showPostRefundSuspendModal}
                        onHide={() => {
                            this.setState({
                                showPostRefundSuspendModal: false,
                            });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Suspend Student?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <p className='my-0'>Do you want to suspend Student from this Package?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                onClick={() => {
                                    this.setState({
                                        showPostRefundSuspendModal: false,
                                    });
                                }}
                            >
                                No
                            </Button>
                            <Button
                                variant='primary'
                                onClick={() => {
                                    this.suspendUserPackage();
                                    this.setState({
                                        showPostRefundSuspendModal: false,
                                    });
                                }}
                            >
                                Yes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal
                        size='lg'
                        show={this.state.showRefundModal}
                        onHide={() => {
                            this.setState({ showRefundModal: false });
                        }}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Refund</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='py-4'>
                            <Form id='refundForm'>
                                <Form.Group as={Row} className='my-0'>
                                    <Form.Label column sm={4} className='text-right pt-2'>
                                        Amount to Refund:
                                    </Form.Label>
                                    <Col sm={8}>
                                        <Form.Control
                                            type='number'
                                            required
                                            min='0'
                                            max={100} // TODO: price the user has paid minus any other refunds, beware it may not be price of the package
                                            id='refund'
                                            name='refund'
                                            onChange={this.handleRefundChange}
                                            placeholder={`Max ${100}...`} // TODO: same as above
                                        />
                                    </Col>
                                </Form.Group>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button
                                variant='secondary'
                                onClick={() => {
                                    this.setState({ showRefundModal: false });
                                }}
                            >
                                Close
                            </Button>
                            <Button
                                disabled={!this.state.refundAmount || this.state.refundAmount == 0}
                                variant='primary'
                                onClick={() => {
                                    // TODO: refund the user (waiting for endpoint)
                                    this.setState({
                                        showRefundModal: false,
                                        refundAmount: 0,
                                    });

                                    if (!this.state.currentUserPackage.suspendedAt) {
                                        this.setState({
                                            showPostRefundSuspendModal: true,
                                        });
                                    }
                                }}
                            >
                                Refund
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Row className='pt-4 pb-2'>
                        <Col md={2} lg={4} xl={6}></Col>
                        <Col md={10} lg={8} xl={6}>
                            <div className='input-group'>
                                <Form.Control
                                    as='select'
                                    value={this.state.selectedPackageId}
                                    custom
                                    onChange={(event) => {
                                        this.selectPackage(event);
                                    }}
                                >
                                    <option disabled value=''>
                                        Select...
                                    </option>
                                    {this.state.availablePackages.map((option, i) => {
                                        return (
                                            <option key={i} value={option._id}>
                                                {option.title}
                                            </option>
                                        );
                                    })}
                                </Form.Control>
                                <ConditionalWrapper
                                    condition={!this.state.selectedPackageId}
                                    wrapper={(children) => (
                                        <OverlayTrigger
                                            overlay={
                                                <Tooltip id={`tooltip-submit`}>{'Select a package to add'}</Tooltip>
                                            }
                                        >
                                            {children}
                                        </OverlayTrigger>
                                    )}
                                >
                                    <Button className='ml-3' type='button' variant='info' onClick={this.addPackage}>
                                        <strong>Add &amp; Save</strong>
                                    </Button>
                                </ConditionalWrapper>
                            </div>
                        </Col>
                    </Row>
                    {this.state.userPackages.map((item, i) => {
                        return (
                            <Row className='py-2' key={i}>
                                <Col>
                                    <Accordion defaultActiveKey={null}>
                                        <Card>
                                            <Card.Header
                                                style={{
                                                    backgroundColor: '#dcf5ee',
                                                }}
                                            >
                                                <Accordion.Toggle as='strong' eventKey='0'>
                                                    {item.data.title}
                                                </Accordion.Toggle>
                                                {item.suspendedAt ? (
                                                    <Accordion.Toggle as='span' eventKey='0'>
                                                        <strong>Suspended: </strong>
                                                        {this.formatDate(item.suspendedAt)}
                                                    </Accordion.Toggle>
                                                ) : (
                                                    <></>
                                                )}
                                                <Accordion.Toggle as='span' eventKey='0'>
                                                    <strong>Purchased: </strong>
                                                    {this.formatDate(item.createdAt)}
                                                    {item?.invoice?.manual ? ' (Manual)' : ''}
                                                </Accordion.Toggle>
                                                <InfoComments articleType='packages' articleId={item._id} />
                                                <OverlayTrigger
                                                    key={`tooltip-view-${i}`}
                                                    placement='top'
                                                    overlay={<Tooltip id={`tooltip-view-${i}`}>View</Tooltip>}
                                                >
                                                    <Accordion.Toggle as='span' size='sm' variant='link' eventKey='0'>
                                                        <CaretToggle />
                                                    </Accordion.Toggle>
                                                </OverlayTrigger>
                                            </Card.Header>
                                            <Accordion.Collapse eventKey='0'>
                                                <Card.Body>
                                                    <Row>
                                                        <Col className='pt-1 pb-4'>
                                                            <div className='float-right d-block'>
                                                                {item.suspendedAt && (
                                                                    <OverlayTrigger
                                                                        key={`tooltip-remove-${i}`}
                                                                        placement='top'
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-remove-${i}`}>
                                                                                Remove
                                                                            </Tooltip>
                                                                        }
                                                                    >
                                                                        <Button
                                                                            variant='info'
                                                                            className='mr-1'
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                this.setState({
                                                                                    modalShow: true,
                                                                                    modalAction: () => {
                                                                                        this.removeUserPackage(
                                                                                            item._id
                                                                                        );
                                                                                    },
                                                                                });
                                                                            }}
                                                                        >
                                                                            <FontAwesomeIcon icon={faTrashAlt} />
                                                                        </Button>
                                                                    </OverlayTrigger>
                                                                )}
                                                                {process.env.REACT_APP_USER_PACKAGE_RESET ===
                                                                    'true' && (
                                                                    <Button
                                                                        variant='info'
                                                                        className='mx-1'
                                                                        onClick={() => {
                                                                            this.resetUserPackage(
                                                                                item._id,
                                                                                item.packageId
                                                                            );
                                                                        }}
                                                                    >
                                                                        <strong>Reset</strong>
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant='info'
                                                                    className='mx-1'
                                                                    onClick={() => {
                                                                        this.setState({
                                                                            showTransactionsModal: true,
                                                                        });
                                                                    }}
                                                                >
                                                                    <strong>Transactions</strong>
                                                                </Button>
                                                                <Button
                                                                    variant='info'
                                                                    className='mx-1'
                                                                    onClick={() => {
                                                                        if (item.suspendedAt) {
                                                                            this.setState({
                                                                                showReactivatePackageModal: true,
                                                                            });
                                                                        } else {
                                                                            this.setState({
                                                                                showSuspendPackageModal: true,
                                                                            });
                                                                        }
                                                                        this.setState({
                                                                            currentUserPackage: item,
                                                                        });
                                                                    }}
                                                                >
                                                                    <strong>
                                                                        {item.suspendedAt ? 'Reactivate' : 'Suspend'}
                                                                    </strong>
                                                                </Button>
                                                                <button
                                                                    type='button'
                                                                    className='btn bd ml-1'
                                                                    onClick={() => {
                                                                        this.setState({
                                                                            showRefundModal: true,
                                                                        });
                                                                    }}
                                                                >
                                                                    <strong>Refund</strong>
                                                                </button>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                    <Table
                                                        minTableWidth='1200px'
                                                        rows={item.courses}
                                                        rowButtons={[
                                                            {
                                                                type: 'button',
                                                                text: (doc) => {
                                                                    return doc.suspendedAt ? 'Reactivate' : 'Suspend';
                                                                },
                                                                icon: (doc) => {
                                                                    return doc.suspendedAt
                                                                        ? faPlayCircle
                                                                        : faStopCircle;
                                                                },
                                                                clickCallback: (e, doc) => {
                                                                    if (doc.suspendedAt) {
                                                                        this.setState({
                                                                            showReactivateCourseModal: true,
                                                                        });
                                                                    } else {
                                                                        this.setState({
                                                                            showSuspendCourseModal: true,
                                                                        });
                                                                    }
                                                                    this.setState({
                                                                        currentUserCourse: doc,
                                                                    });
                                                                },
                                                            },
                                                            {
                                                                type: 'button',
                                                                text: 'Manage',
                                                                classes: 'bp',
                                                                disabled: (doc) => {
                                                                    if (!!doc?.editingAdmin?._id) {
                                                                        return `${doc.editingAdmin.firstName} ${doc.editingAdmin.lastName} is editing`;
                                                                    }

                                                                    return '';
                                                                },
                                                                clickCallback: (e, doc) => {
                                                                    this.setState({
                                                                        showManageModal: true,
                                                                        currentUserCourse: doc,
                                                                    });
                                                                },
                                                            },
                                                        ]}
                                                        columns={[
                                                            {
                                                                text: 'Course name',
                                                                field: (row) => {
                                                                    return <span>{row.title}</span>;
                                                                },
                                                                maxWidth: '20rem',
                                                                className: 'limitTitle',
                                                            },
                                                            {
                                                                text: 'Enrolled on',
                                                                field: (row) => {
                                                                    return this.formatDate(row.enrollmentUpdatedAt);
                                                                },
                                                            },
                                                            {
                                                                text: 'Expiry date',
                                                                field: (row) => {
                                                                    return this.formatDate(row.expiresAt);
                                                                },
                                                            },
                                                            {
                                                                text: 'Progress',
                                                                field: (row) => {
                                                                    const totalHours = shortEnglishHumanizer(
                                                                        row.lessons.totalRequiredTime * 60_000,
                                                                        {
                                                                            units: ['h'],
                                                                            round: true,
                                                                        }
                                                                    );

                                                                    return (
                                                                        <>
                                                                            {row.percentageProgress} % of&nbsp;
                                                                            {totalHours}
                                                                        </>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                text: 'Time spent',
                                                                field: (row) => {
                                                                    return (
                                                                        <>
                                                                            {shortEnglishHumanizer(
                                                                                row.lessons?.timeSpent
                                                                            )}
                                                                        </>
                                                                    );
                                                                },
                                                            },
                                                            {
                                                                text: 'Completed on',
                                                                field: (row) => {
                                                                    return this.formatDate(row.completedAt);
                                                                },
                                                            },
                                                        ]}
                                                    />
                                                </Card.Body>
                                            </Accordion.Collapse>
                                        </Card>
                                    </Accordion>
                                </Col>
                            </Row>
                        );
                    })}
                </section>
            );
        }
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(UserPackages));
