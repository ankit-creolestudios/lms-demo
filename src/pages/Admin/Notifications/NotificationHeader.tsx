import { camelCase } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import DatePicker from 'src/components/DatePicker/DatePicker';
import Editor from 'src/components/Editor';
import { Api, EventBus } from 'src/helpers/new';
import NotificationContext from './NotificationContext';

interface IProps extends RouteComponentProps {}

interface IState {
    showModal: boolean;
    modalFormData: {
        announcementTitle: string;
        startDate: string;
        endDate: string;
    };
}
class NotificationHeader extends Component<IProps, IState> {
    static contextType = NotificationContext;

    constructor(props: any) {
        super(props);
        this.state = {
            showModal: false,
            modalFormData: {
                announcementTitle: '',
                startDate: '',
                endDate: '',
            },
        };
    }

    toggleModal = () => {
        this.setState({
            showModal: !this.state.showModal,
            modalFormData: {
                announcementTitle: '',
                startDate: '',
                endDate: '',
            },
        });
    };

    handleFormChange = (key: string, value: string | boolean) => {
        this.setState({
            modalFormData: {
                ...this.state.modalFormData,
                [key]: value,
            },
        });
    };

    handleFormSave = async () => {
        const { modalFormData } = this.state;
        const payload = {
            ...modalFormData,
            startDate: moment(modalFormData.startDate).format('YYYY/MM/DD'),
            endDate: moment(modalFormData.endDate).format('YYYY/MM/DD'),
        };
        const { success, response } = await Api.call('POST', '/announcement/create', payload);

        if (success) {
            this.context.setAnnouncementDataLength(1);
            this.toggleModal();
        }
    };

    render() {
        const { modalFormData, showModal } = this.state;

        return (
            <div
                className='notification-header'
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                }}
            >
                {this.props.location.pathname === '/admin/notifications' ? (
                    <>
                        <h3>Notifications</h3>
                        <Link className='btn bp btn--small' to={'/admin/notifications/add'}>
                            New Notification
                        </Link>
                    </>
                ) : this.props.location.pathname === '/admin/notifications/mailingList' ? (
                    <>
                        <h3>Mailing List</h3>
                        <Link className='btn bp btn--small' to={'/admin/notifications/mailingList/add/setup'}>
                            New Mailing List
                        </Link>
                    </>
                ) : this.props.location.pathname === '/admin/notifications/announcement' ? (
                    <>
                        <h3>Announcement</h3>
                        <p
                            className='btn bp btn--small'
                            onClick={() => {
                                if (this.context.announcementDataLength === 0) {
                                    this.toggleModal();
                                } else {
                                    EventBus.dispatch('toast', {
                                        type: 'warning',
                                        message: 'You are not allowed create more than one Announcement',
                                    });
                                }
                            }}
                        >
                            New Announcement
                        </p>
                    </>
                ) : (
                    this.props.location.pathname === '/admin/notifications/broadcast' && (
                        <>
                            <h3>Broadcast</h3>
                            <Link className='btn bp btn--small' to={'/admin/notifications/broadcast/add'}>
                                New Broadcast
                            </Link>
                        </>
                    )
                )}
                <Modal
                    show={showModal}
                    onHide={this.toggleModal}
                    style={{
                        zIndex: 1000,
                    }}
                    backdropClassName='notification-module-backdrop'
                    enforceFocus={false}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Create Announcement</Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ minHeight: '35vh' }}>
                        <Row>
                            <Col sm={12}>
                                <div className='form__field'>
                                    <label htmlFor='announcementTitle'>Announcement Title</label>
                                    <Editor
                                        defaultValue={modalFormData.announcementTitle}
                                        name='announcementTitle'
                                        onChange={(e: any) =>
                                            this.handleFormChange('announcementTitle', e.target.value)
                                        }
                                        disableInsertImage={true}
                                        disableInsertTable={true}
                                    />
                                </div>
                            </Col>
                        </Row>
                        <div className='form__field'>
                            <label htmlFor={camelCase('Start Date')}>Start Date</label>
                            <DatePicker
                                required
                                name={camelCase('Start Date')}
                                onChange={(e: any) => this.handleFormChange(camelCase('Start Date'), e.target.value)}
                                date={modalFormData?.startDate ?? ''}
                                showClearDate
                            />
                        </div>
                        <div className='form__field'>
                            <label htmlFor={camelCase('End Date')}>End Date</label>
                            <DatePicker
                                required
                                name={camelCase('End Date')}
                                onChange={(e: any) => this.handleFormChange(camelCase('End Date'), e.target.value)}
                                date={modalFormData?.endDate ?? ''}
                                showClearDate
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='primary' onClick={this.toggleModal}>
                            Cancel
                        </Button>
                        <Button variant='secondary' onClick={this.handleFormSave}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default withRouter(NotificationHeader);
