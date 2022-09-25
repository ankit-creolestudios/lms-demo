import React, { Component } from 'react';
import { capitalize, startCase } from 'lodash';
import { OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import { setState } from 'src/helpers/localStorage';
import { Api } from 'src/helpers/new';
import apiCall from '../../../../../helpers/apiCall';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEdit, faEnvelope, faInbox } from '@fortawesome/free-solid-svg-icons';
import { IConnectProps } from 'src/pages/Admin/Notifications/Notifications';
import moment from 'moment';
import { FaTimes } from 'react-icons/fa';
import './notifications.scss';
import { InputFilterForm } from 'src/components/_New/TableFiltersForm/InputFilterForm';
import { SelectFilterForm } from 'src/components/_New/TableFiltersForm/SelectFilterForm';

interface IState {
    course: any;
    filters: {
        name: string;
        condition: string;
        mailingListId: string;
    };
    reloadTable: number;
    formOptions: any;
}

interface IProps extends RouteComponentProps, IConnectProps {
    match: {
        isExact: true;
        path: string;
        url: string;
        params: {
            courseId: string;
        };
    };
}

class Notifications extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            course: {},
            filters: {
                name: '',
                condition: '',
                mailingListId: '',
            },
            reloadTable: 0,
            formOptions: {},
        };
    }

    componentDidMount = async () => {
        this.fetchFormOptions();
        const { response } = await apiCall('GET', `/courses/${this.props.match.params.courseId}`);

        this.setState({
            course: response,
        });

        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.pushBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params?.courseId}`,
        });
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.removeBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
    };

    fetchFormOptions = async () => {
        const { success, response } = await Api.call('GET', '/notifications/mail-params');
        if (success) {
            this.setState({
                formOptions: response,
            });
        }
    };

    getFilters = () => {
        let filterParams = '';
        const { name, condition, mailingListId } = this.state.filters;
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

    setTableFilters = (key: string, value: string) => {
        this.setState({
            filters: {
                ...this.state.filters,
                [key]: value,
            },
        });
    };

    handleResetFilter = (keyName: string) => {
        this.setTableFilters(keyName, '');
    };

    findMailingListName = (id: string) => {
        return this.state.formOptions.mailingLists.find((list: any) => list._id === id)?.name;
    };

    render() {
        return (
            <>
                <Row>
                    {Object.entries(this.state.filters).map(
                        (filterData: [string, any]) =>
                            !!filterData[1] && (
                                <div
                                    key={filterData[0]}
                                    onClick={() => this.handleResetFilter(filterData[0])}
                                    className='course-notification-table-chip'
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
                    basePath={`admin/courses/${this.props.match.params.courseId}/notifications`}
                    noSearch={true}
                    apiCall={{
                        method: 'GET',
                        path: `/courses/${this.props.match.params.courseId}/notifications`,
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
                                    handleFormChange={this.setTableFilters}
                                    formName='notification'
                                    keyName='name'
                                    value={this.state.filters.name}
                                />
                            ),
                        },
                        {
                            text: 'Conditions',
                            field: (row: any) => row.sendCondition?.displayName,
                            filter: () => (
                                <SelectFilterForm
                                    optionData={this.state.formOptions.sendMailConditions}
                                    optionKey='displayName'
                                    optionValue='displayName'
                                    name='Condition'
                                    handleFormChange={this.setTableFilters}
                                    formName='notification'
                                    keyName='condition'
                                    value={this.state.filters.condition}
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
                                    optionData={this.state.formOptions.mailingLists}
                                    optionKey='_id'
                                    optionValue='name'
                                    name='Mailing List'
                                    handleFormChange={this.setTableFilters}
                                    formName='notification'
                                    keyName='mailingListId'
                                    value={this.state.filters.mailingListId}
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
})(withRouter(Notifications));
