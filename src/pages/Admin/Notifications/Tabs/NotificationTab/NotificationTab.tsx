import React, { Component } from 'react';
import { OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import NotificationContext, { ContextType } from '../../NotificationContext';
import { IConnectProps } from '../../Notifications';
import './notificationTab.scss';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { FaTimes } from 'react-icons/fa';
import { faTrash, faEdit, faEnvelope, faInbox } from '@fortawesome/free-solid-svg-icons';
import { Api } from 'src/helpers/new';
import { capitalize, startCase } from 'lodash';
import moment from 'moment';
import { ConfirmationModal } from 'src/components/ConfirmationModal';
import { setState } from 'src/helpers/localStorage';
import './notificationTab.scss';
import { InputFilterForm } from 'src/components/_New/TableFiltersForm/InputFilterForm';
import { SelectFilterForm } from 'src/components/_New/TableFiltersForm/SelectFilterForm';
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
class NotificationTab extends Component<IProps, IState> {
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
            text: 'Notification',
            path: '/admin/notifications',
        });
    };

    getFilters = () => {
        let filterParams = '';
        const { name, condition, mailingListId } = this.context.tableFilters.notification;
        if (!!name) {
            filterParams += `name=${name}&`;
        }
        if (!!condition) {
            filterParams += `condition=${condition}&`;
        }
        if (!!mailingListId) {
            filterParams += `mailingListId=${mailingListId}`;
        }
        return filterParams;
    };

    findMailingListName = (id: string) => {
        return this.context.formOptions.mailingLists.find((list: any) => list._id === id)?.name;
    };

    handleResetFilter = (keyName: string) => {
        this.context.setTableFilters('notification', keyName, '');
    };

    render() {
        return (
            <>
                <Row>
                    {Object.entries(this.context.tableFilters.notification).map(
                        (filterData: [string, any]) =>
                            !!filterData[1] && (
                                <div
                                    key={filterData[0]}
                                    onClick={() => this.handleResetFilter(filterData[0])}
                                    className='search-bar'
                                >
                                    <span>
                                        {filterData[0] === 'mailingListId' ? 'Mailing List' : startCase(filterData[0])}
                                        :&nbsp;
                                    </span>
                                    <span>
                                        {filterData[0] === 'mailingListId'
                                            ? this.findMailingListName(filterData[1])
                                            : filterData[1]}
                                    </span>
                                    &nbsp;
                                    <FaTimes />
                                </div>
                            )
                    )}
                </Row>
                <ApiTable
                    reload={this.state.reloadTable}
                    basePath='/admin/notifications'
                    noSearch={true}
                    apiCall={{
                        method: 'GET',
                        path: '/notifications',
                        params: `${window.location.search}&${this.getFilters()}`,
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
                                            to={'/admin/notifications/edit'}
                                            onClick={() => {
                                                this.context.updateNotificationState('selectedNotificationId', row._id);
                                                setState('selectedNotificationId', row._id);
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
                            text: 'Name',
                            field: (row: any) => {
                                return capitalize(row.name);
                            },
                            filter: () => (
                                <InputFilterForm
                                    name='Name'
                                    handleFormChange={this.context.setTableFilters}
                                    formName='notification'
                                    keyName='name'
                                    value={this.context.tableFilters.notification.name}
                                />
                            ),
                        },
                        {
                            text: 'Conditions',
                            field: (row: any) => row.sendCondition?.displayName,
                            filter: () => (
                                <SelectFilterForm
                                    optionData={this.context.formOptions.sendMailConditions}
                                    optionKey='displayName'
                                    optionValue='displayName'
                                    name='Condition'
                                    handleFormChange={this.context.setTableFilters}
                                    formName='notification'
                                    keyName='condition'
                                    value={this.context.tableFilters.notification.condition}
                                />
                            ),
                        },
                        {
                            text: 'Schedule',
                            field: (row: any) =>
                                row.sendOffsetDays === 0
                                    ? 'Immediately'
                                    : `${row.sendOffsetDays} day${row.sendOffsetDays !== 1 ? 's' : ''} ${
                                          row.sendSchedule
                                      }`,
                        },
                        {
                            text: 'Mailing List',
                            field: (row: any) => row.mailingList?.name,
                            filter: () => (
                                <SelectFilterForm
                                    optionData={this.context.formOptions.mailingLists}
                                    optionKey='_id'
                                    optionValue='name'
                                    name='Mailing List'
                                    handleFormChange={this.context.setTableFilters}
                                    formName='notification'
                                    keyName='mailingListId'
                                    value={this.context.tableFilters.notification.mailingListId}
                                />
                            ),
                        },
                        {
                            text: 'Method(s)',
                            field: (row: any) => (
                                <div className='method-icon-container'>
                                    <Fa
                                        icon={faEnvelope}
                                        opacity={row.sendMethod.includes('email') ? 1 : 0.6}
                                        size={'2x'}
                                        className='method-icon'
                                    />
                                    <Fa
                                        icon={faInbox}
                                        opacity={row.sendMethod.includes('inbox') ? 1 : 0.6}
                                        size={'2x'}
                                        className='method-icon'
                                    />
                                </div>
                            ),
                        },
                        {
                            text: 'Last Updated',
                            field: (row: any) => moment(row.updatedAt).format('DD/MM/YYYY'),
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
                                            '/notifications/delete/' + row._id
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
                    bodyText='Are you sure you want to delete the Notification?'
                    confirmAction={this.state.modalConfirmAction}
                />
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
})(NotificationTab);
