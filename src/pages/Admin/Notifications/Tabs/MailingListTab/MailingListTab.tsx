import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ConfirmationModal } from 'src/components/ConfirmationModal';
import NotificationContext, { ContextType } from '../../NotificationContext';
import { IConnectProps } from '../../Notifications';
import './mailingListTab.scss';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { ApiTable } from 'src/components/ApiTable';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { setState } from 'src/helpers/localStorage';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Api } from 'src/helpers/new';

interface IProps extends RouteComponentProps, IConnectProps {
    activeIndex: number;
    context: ContextType;
    docId?: string | undefined;
}

interface IState {
    reloadTable: number;
    showModal: boolean;
    modalConfirmAction?: () => Promise<void>;
}
class MailingListTab extends Component<IProps, IState> {
    static contextType = NotificationContext;
    constructor(props: any) {
        super(props);
        this.state = {
            reloadTable: 0,
            showModal: false,
        };
    }

    componentDidMount = () => {
        this.props.pushBreadcrumbLink({
            text: 'Mailing Lists',
            path: '/admin/notifications/mailingList',
        });
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Mailing Lists',
            path: '/admin/notifications/mailingList',
        });
    };

    render() {
        return (
            <div
                style={{
                    paddingTop: '20px',
                }}
            >
                <ApiTable
                    reload={this.state.reloadTable}
                    basePath='/admin/notifications/mailingList'
                    apiCall={{
                        method: 'GET',
                        path: '/mailingLists',
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
                                                Edit Notification
                                            </Tooltip>
                                        }
                                    >
                                        <Link
                                            className='btn btn--small'
                                            to={'/admin/notifications/mailingList/edit/setup'}
                                            onClick={() => {
                                                this.context.updateNotificationState('selectedMailingListId', row._id);
                                                setState('selectedMailingListId', row._id);
                                            }}
                                        >
                                            <Fa icon={faEdit} />
                                        </Link>
                                    </OverlayTrigger>
                                );
                            },
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Mailing List',
                            field: (row: any) => {
                                return row.name;
                            },
                        },
                        {
                            text: 'Subscribers',
                            field: (row: any) => row?.subscribersCount ?? 0,
                        },
                        {
                            text: 'Unsubscribers',
                            field: (row: any) => row?.unSubscribersCount ?? 0,
                        },
                        {
                            text: 'Date Created',
                            field: (row: any) => moment(row.createdAt).format('DD/MM/YYYY'),
                        },
                    ]}
                    rowButtons={[
                        {
                            text: 'Delete Notification',
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
                                            '/mailingList/delete/' + row._id
                                        );
                                        if (success) {
                                            await reloadTable();
                                        }
                                    },
                                });
                            },
                        },
                    ]}
                />
                <ConfirmationModal
                    show={this.state.showModal !== false}
                    hideModal={() =>
                        this.setState({
                            showModal: false,
                        })
                    }
                    bodyText='Are you sure you want to delete the Mailing List?'
                    confirmAction={this.state.modalConfirmAction}
                />
            </div>
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
})(MailingListTab);
