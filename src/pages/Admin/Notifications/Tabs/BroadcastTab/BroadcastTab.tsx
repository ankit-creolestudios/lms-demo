import React, { Component } from 'react';
import { OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link, RouteComponentProps } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import { setState } from 'src/helpers/localStorage';
import NotificationContext, { ContextType } from '../../NotificationContext';
import { IConnectProps } from '../../Notifications';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { FaTimes } from 'react-icons/fa';
import { faTrash, faEdit, faEnvelope, faInbox } from '@fortawesome/free-solid-svg-icons';
import './broadcastTab.scss';
import { capitalize, startCase } from 'lodash';
import moment from 'moment';
import { ConfirmationModal } from 'src/components/ConfirmationModal';
import { Api } from 'src/helpers/new';
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
class BroadcastTab extends Component<IProps, IState> {
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
            text: 'Broadcast',
            path: '/admin/notifications/broadcast',
        });
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Broadcast',
            path: '/admin/notifications/broadcast',
        });
    };

    getFilters = () => {
        let filterParams = '';
        const { name, mailingListId } = this.context.tableFilters.broadcast;
        if (!!name) {
            filterParams += `name=${name}&`;
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
        this.context.setTableFilters('broadcast', keyName, '');
    };

    render() {
        return (
            <>
                <Row>
                    {Object.entries(this.context.tableFilters.broadcast).map(
                        (filterData: [string, any]) =>
                            !!filterData[1] && (
                                <div
                                    key={filterData[0]}
                                    onClick={() => this.handleResetFilter(filterData[0])}
                                    style={{
                                        border: '1px solid',
                                        background: '#f5fafd',
                                        padding: '5px 8px',
                                        fontSize: '15px',
                                        margin: '0 0 10px 10px',
                                        cursor: 'pointer',
                                        marginTop: '20px',
                                    }}
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
                    basePath='/admin/notifications/broadcast'
                    noSearch={true}
                    apiCall={{
                        method: 'GET',
                        path: '/broadcasts',
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
                                            <Tooltip id={`tooltip-${row._id}-edit-broadcast)}`}>Edit Broadcast</Tooltip>
                                        }
                                    >
                                        <Link
                                            className='btn btn--small'
                                            to={'/admin/notifications/broadcast/edit'}
                                            onClick={() => {
                                                this.context.updateNotificationState('selectedBroadcastId', row._id);
                                                setState('selectedBroadcastId', row._id);
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
                                    formName='broadcast'
                                    keyName='name'
                                    value={this.context.tableFilters.broadcast.name}
                                />
                            ),
                        },
                        {
                            text: 'Schedule',
                            field: (row: any) => moment(row.sendDate, 'YYYY/MM/DD').format('DD/MM/YYYY'),
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
                                    formName='broadcast'
                                    keyName='mailingListId'
                                    value={this.context.tableFilters.broadcast.mailingListId}
                                />
                            ),
                        },
                        {
                            text: 'Method(s)',
                            field: (row: any) => (
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    <Fa
                                        icon={faEnvelope}
                                        opacity={row.sendMethod.includes('email') ? 1 : 0.6}
                                        style={{ marginRight: '10px' }}
                                        size={'2x'}
                                    />
                                    <Fa
                                        icon={faInbox}
                                        opacity={row.sendMethod.includes('inbox') ? 1 : 0.6}
                                        size={'2x'}
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
                            text: 'Delete Broadcast',
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
                                            '/broadcast/delete/' + row._id
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
                    bodyText='Are you sure you want to delete the Broadcast?'
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
})(BroadcastTab);
