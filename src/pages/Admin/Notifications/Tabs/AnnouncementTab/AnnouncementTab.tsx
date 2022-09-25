import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import NotificationContext, { ContextType } from '../../NotificationContext';
import { IConnectProps } from '../../Notifications';
import './announcementTab.scss';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Button, Col, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { Api } from 'src/helpers/new';
import { ConfirmationModal } from 'src/components/ConfirmationModal';
import moment from 'moment';
import withContext from 'src/helpers/withContext';
import Editor from 'src/components/Editor';
import DatePicker from 'src/components/DatePicker/DatePicker';
import { camelCase } from 'lodash';
interface IProps extends RouteComponentProps, IConnectProps {
    activeIndex: number;
    context: ContextType;
    docId?: string | undefined;
    contextValue: ContextType;
}

interface IState {
    showModal: boolean;
    modalFormData: {
        announcementTitle: string;
        startDate: string;
        endDate: string;
        selectedId?: string;
    };
    showEditModal: boolean;
    reloadTable: number;
    selectedId: string;
    modalConfirmAction?: () => Promise<void>;
}

class AnnouncementTab extends Component<IProps, IState> {
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
            showEditModal: false,
            reloadTable: 0,
            selectedId: '',
        };
    }

    componentDidMount = () => {
        this.props.pushBreadcrumbLink({
            text: 'Announcements',
            path: '/admin/notifications/announcement',
        });
    };

    componentDidUpdate = (prevProps: any) => {
        if (prevProps.contextValue.announcementDataLength !== this.props.contextValue.announcementDataLength) {
            this.setState({
                reloadTable: this.state.reloadTable + 1,
            });
        }
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Announcements',
            path: '/admin/notifications/announcement',
        });
    };

    toggleModal = () => {
        this.setState({
            showEditModal: !this.state.showEditModal,
            modalFormData: {
                announcementTitle: '',
                startDate: '',
                endDate: '',
                selectedId: '',
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
        const { modalFormData, selectedId } = this.state;
        const payload = {
            ...modalFormData,
            startDate: moment(modalFormData.startDate).format('YYYY/MM/DD'),
            endDate: moment(modalFormData.endDate).format('YYYY/MM/DD'),
        };
        await Api.call('PUT', `/announcement/update/${selectedId}`, payload);

        this.toggleModal();
        this.setState({
            reloadTable: this.state.reloadTable + 1,
        });
    };

    fetchAnnouncementDetails = async (id: string) => {
        const { success, response } = await Api.call('GET', `/announcement/${id}`);
        if (success) {
            this.setState({
                modalFormData: {
                    announcementTitle: response.announcementTitle,
                    startDate: response.startDate,
                    endDate: response.endDate,
                },
            });
        }
    };

    render() {
        const { showModal, showEditModal, modalFormData } = this.state;

        return (
            <>
                <ApiTable
                    reload={this.state.reloadTable}
                    basePath='/admin/notifications/announcement'
                    noSearch={true}
                    apiCall={{
                        method: 'GET',
                        path: '/announcements',
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row: any) => {
                                return (
                                    <OverlayTrigger
                                        placement='top'
                                        overlay={
                                            <Tooltip id={`tooltip-${row._id}-edit-notification)}`}>
                                                Edit Announcement
                                            </Tooltip>
                                        }
                                    >
                                        <p
                                            className='btn btn--small'
                                            style={{ margin: 0 }}
                                            onClick={async () => {
                                                this.toggleModal();
                                                this.setState({
                                                    selectedId: row._id,
                                                });
                                                this.fetchAnnouncementDetails(row._id);
                                            }}
                                        >
                                            <Fa icon={faEdit} />
                                        </p>
                                    </OverlayTrigger>
                                );
                            },
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Title',
                            field: (row: any) => {
                                return row.announcementTitle.length > 50
                                    ? `${row.announcementTitle.substring(0, 51).replace(/<[^>]*>/g, '')} ...`
                                    : row.announcementTitle.replace(/<[^>]*>/g, '');
                            },
                            maxWidth: '50%',
                        },
                        {
                            text: 'Start Date',
                            field: (row: any) => moment(row.startDate).format('DD/MM/YYYY'),
                            maxWidth: '25%',
                        },
                        {
                            text: 'End Date',
                            field: (row: any) => moment(row.endDate).format('DD/MM/YYYY'),
                            maxWidth: '25%',
                        },
                    ]}
                    rowButtons={[
                        {
                            text: 'Delete Announcement',
                            icon: faTrash,
                            clickCallback: async (e: any, row: any, reloadTable: any) => {
                                this.setState({
                                    showModal: row,
                                    modalConfirmAction: async () => {
                                        this.setState({
                                            showModal: false,
                                        });
                                        const { success, message } = await Api.call(
                                            'DELETE',
                                            '/announcement/delete/' + row._id
                                        );
                                        if (success) {
                                            this.context.setAnnouncementDataLength(0);
                                            await reloadTable();
                                        }
                                    },
                                });
                            },
                        },
                    ]}
                />
                <ConfirmationModal
                    show={showModal !== false}
                    hideModal={() =>
                        this.setState({
                            showModal: false,
                        })
                    }
                    bodyText='Are you sure you want to delete the Notification?'
                    confirmAction={this.state.modalConfirmAction}
                />
                <Modal
                    show={showEditModal}
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
                            Update
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withContext(AnnouncementTab, NotificationContext));
