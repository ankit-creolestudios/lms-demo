import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import { getState } from 'src/helpers/localStorage';
import { Api } from 'src/helpers/new';
import EditBroadcastPage from './EditBroadcastPage/EditBroadcastPage';
import EditMailingListPage from './EditMailingListPage/EditMailingListPage';
import EditNotificationPage from './EditNotificationsPage/EditNotificationsPage';
import NotificationContext from './NotificationContext';
import NotificationHeader from './NotificationHeader';
import NotificationTabs from './NotificationTabs';
import AnnouncementTab from './Tabs/AnnouncementTab/AnnouncementTab';
import BroadcastTab from './Tabs/BroadcastTab/BroadcastTab';
import MailingListTab from './Tabs/MailingListTab/MailingListTab';
import NotificationTab from './Tabs/NotificationTab/NotificationTab';
import './notifications.scss';
import { camelCase } from 'lodash';

interface IProps extends RouteComponentProps, IConnectProps {}

interface IState {
    activeTab: number;
    formOptions: any;
    broadCastForm: any;
    notificationForm: any;
    setupForm: any;
    selectedNotificationId: string;
    selectedBroadcastId: string;
    selectedMailingListId: string;
    announcementDataLength: number;
    reloadTable: number;
    tableFilters: TableFilters;
    parameters: string[];
    [key: string]: any;
}

export type TableFilters = {
    [key: string]: any;
    notification: {
        condition: string;
        name: string;
        mailingListId: string;
        [key: string]: any;
    };
    broadcast: {
        name: string;
        mailingListId: string;
        [key: string]: any;
    };
};
export interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
    setFormActions: (payload: any) => void;
}
class Notifications extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            activeTab: 1,
            formOptions: {},
            broadCastForm: {
                name: '',
                sendDate: '',
                email: false,
                inbox: false,
                mailingList: '',
                sendDomain: '',
                useHeader: '<div>header</div>',
                useFooter: '<div>footer</div>',
                subject: '',
                preHeader: '',
                messageBody: '',
            },
            notificationForm: {
                applicableItems: [],
                email: false,
                inbox: false,
                mailingList: '',
                messageBody: '',
                modeSwitch: false,
                name: '',
                preHeader: '',
                scheduleOffset: '',
                sendCondition: '',
                sendDomain: '',
                sendSchedule: '',
                subject: '',
                useHeader: '<div>header</div>',
                useFooter: '<div>footer</div>',
            },
            setupForm: {
                name: '',
                description: '',
                email: false,
                inbox: false,
            },
            selectedNotificationId: '',
            selectedMailingListId: '',
            announcementDataLength: 0,
            selectedBroadcastId: '',
            reloadTable: 0,
            tableFilters: {
                notification: {
                    condition: '',
                    name: '',
                    mailingListId: '',
                },
                broadcast: {
                    name: '',
                    mailingListId: '',
                },
            },
            parameters: [
                '{{firstName}}',
                '{{lastName}}',
                '{{email}}',
                '{{phoneNumber}}',
                '{{addressLineOne}}',
                '{{addressLineTwo}}',
                '{{townCity}}',
                '{{state}}',
                '{{zipCode}}',
                '{{courseTitle}}',
                '{{completionDate}}',
                '{{examStatus}}',
                '{{examScore}}',
                '{{courseExpiresIn}}',
                '{{courseExpiryDate}}',
                '{{tokenUrl}}',
            ],
        };
        this.props.pushBreadcrumbLink({
            text: 'Notification',
            path: '/admin/notifications',
        });
    }

    componentDidMount = async () => {
        await this.fetchFormOptions();
        await this.fetchAnnouncementDataLength();
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Notification',
            path: '/admin/notifications',
        });
    };

    updateNotificationState = (key: keyof IState, value: any) => {
        this.setState({
            [key]: value,
        });
    };

    setTableFilters = (tableName: string, key: string, value: string) => {
        this.setState({
            tableFilters: {
                ...this.state.tableFilters,
                [tableName]: {
                    ...this.state.tableFilters?.[tableName],
                    [key]: value,
                },
            },
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

    fetchNotificationData = async () => {
        const { success, response } = await Api.call(
            'GET',
            `/notifications/${this.context.selectedNotificationId ?? getState('selectedNotificationId')}`
        );

        if (success) {
            this.setState({
                notificationForm: {
                    applicableItems: response[0]?.whitelist.map((data: any) => data.itemId),
                    email: response[0]?.sendMethod.includes('email'),
                    inbox: response[0]?.sendMethod.includes('inbox'),
                    mailingList: response[0]?.mailingList[0]?._id,
                    messageBody: response[0]?.mailBody,
                    modeSwitch: true,
                    name: response[0]?.name,
                    preHeader: response[0]?.mailPreHeader,
                    scheduleOffset: response[0]?.sendOffsetDays,
                    sendCondition: response[0]?.sendCondition.key,
                    sendDomain: response[0]?.sendDomain,
                    sendSchedule: response[0]?.sendSchedule,
                    subject: response[0]?.mailSubject,
                    useHeader: '<div>header</div>',
                    useFooter: '<div>footer</div>',
                },
            });
        }
    };

    fetchBroadcastData = async () => {
        const { success, response } = await Api.call(
            'GET',
            `/broadcast/${this.context.selectedBroadcastId ?? getState('selectedBroadcastId')}`
        );
        if (success) {
            this.setState({
                broadCastForm: {
                    name: response[0].name,
                    sendDate: moment(response[0].sendDate, 'YYYY/MM/DD').format('MM/DD/YYYY'),
                    email: response[0].sendMethod.includes('email'),
                    inbox: response[0].sendMethod.includes('inbox'),
                    mailingList: response[0]?.mailingList[0]?._id,
                    sendDomain: response[0].sendDomain,
                    useHeader: '<div>header</div>',
                    useFooter: '<div>footer</div>',
                    subject: response[0].mailSubject,
                    preHeader: response[0].mailPreHeader,
                    messageBody: response[0].mailBody,
                },
            });
        }
    };

    resetNotificationForm = () => {
        this.setState({
            notificationForm: {
                applicableItems: [],
                email: false,
                inbox: false,
                mailingList: '',
                messageBody: '',
                modeSwitch: false,
                name: '',
                preHeader: '',
                scheduleOffset: '',
                sendCondition: '',
                sendDomain: '',
                sendSchedule: '',
                subject: '',
                useHeader: '<div>header</div>',
                useFooter: '<div>footer</div>',
            },
        });
    };

    resetBroadcastForm = () => {
        this.setState({
            broadCastForm: {
                name: '',
                sendDate: '',
                email: false,
                inbox: false,
                mailingList: '',
                sendDomain: '',
                useHeader: '<div>header</div>',
                useFooter: '<div>footer</div>',
                subject: '',
                preHeader: '',
                messageBody: '',
            },
        });
    };

    fetchAnnouncementDataLength = async () => {
        const { success, response } = await Api.call('GET', `/announcements`);
        this.setState({
            announcementDataLength: response.docs.length,
        });
    };

    fetchMailingListData = async () => {
        const mailingListId = this.state.selectedMailingListId
            ? this.state.selectedMailingListId
            : getState('selectedMailingListId');

        const { success, response } = await Api.call('GET', `/mailingLists/${mailingListId}`);

        if (success) {
            this.setState({
                setupForm: {
                    name: response.name,
                    description: response.description,
                    email: response.isUnsubscriptionAllowed?.includes('email'),
                    inbox: response.isUnsubscriptionAllowed?.includes('inbox'),
                },
            });
        }
    };

    setAnnouncementDataLength = (value: number) => {
        this.setState({
            announcementDataLength: value,
        });
    };

    setActiveTab = (n: number) => {
        this.setState({
            activeTab: n,
        });
    };

    handleBroadcastForm = (
        key: string | React.ChangeEvent<HTMLInputElement>,
        value: string | number | boolean | any[]
    ) => {
        const mainKey = typeof key === 'object' ? camelCase(key?.target?.name) : key;
        this.setState({
            broadCastForm: {
                ...this.state.broadCastForm,
                [mainKey]: value,
            },
        });
    };

    handleNotificationForm = (
        key: string | React.ChangeEvent<HTMLInputElement>,
        value: string | number | boolean | any[]
    ) => {
        const mainKey = typeof key === 'object' ? camelCase(key?.target?.name) : key;
        this.setState({
            notificationForm: {
                ...this.state.notificationForm,
                [mainKey]: value,
            },
        });
    };

    handleSetupForm = (key: string | React.ChangeEvent<HTMLInputElement>, value: string | number | boolean | any[]) => {
        const mainKey = typeof key === 'object' ? camelCase(key?.target?.name) : key;
        this.setState({
            setupForm: {
                ...this.state.setupForm,
                [mainKey]: value,
            },
        });
    };

    resetSetupForm = () => {
        this.setState({
            setupForm: {
                name: '',
                description: '',
                email: false,
                inbox: false,
            },
        });
    };

    render() {
        const {
            activeTab,
            formOptions,
            broadCastForm,
            notificationForm,
            selectedNotificationId,
            selectedBroadcastId,
            setupForm,
            selectedMailingListId,
            announcementDataLength,
            reloadTable,
            tableFilters,
            parameters,
        } = this.state;
        const {
            setActiveTab,
            handleBroadcastForm,
            handleNotificationForm,
            fetchNotificationData,
            fetchBroadcastData,
            handleSetupForm,
            fetchMailingListData,
            fetchAnnouncementDataLength,
            setAnnouncementDataLength,
            resetNotificationForm,
            resetBroadcastForm,
            resetSetupForm,
            setTableFilters,
            updateNotificationState,
        } = this;

        if (
            this.props.location.pathname === '/admin/notifications/mailingList/add' ||
            this.props.location.pathname === '/admin/notifications/mailingList/edit'
        ) {
            this.props.history.push(`${this.props.location.pathname}/setup`);
        }

        return (
            <NotificationContext.Provider
                value={{
                    activeTab,
                    setActiveTab,
                    formOptions,
                    broadCastForm,
                    handleBroadcastForm,
                    notificationForm,
                    handleNotificationForm,
                    selectedNotificationId,
                    fetchNotificationData,
                    setupForm,
                    handleSetupForm,
                    selectedMailingListId,
                    fetchMailingListData,
                    announcementDataLength,
                    fetchAnnouncementDataLength,
                    setAnnouncementDataLength,
                    reloadTable,
                    selectedBroadcastId,
                    fetchBroadcastData,
                    resetNotificationForm,
                    resetBroadcastForm,
                    resetSetupForm,
                    tableFilters,
                    setTableFilters,
                    parameters,
                    updateNotificationState,
                }}
            >
                <NotificationHeader />
                <NotificationTabs />
                <Switch>
                    <Route exact path='/admin/notifications/mailingList/:action/:tab' component={EditMailingListPage} />
                    <div className='tab-content'>
                        <Route exact path='/admin/notifications' component={NotificationTab} />
                        <Route exact path='/admin/notifications/mailingList' component={MailingListTab} />
                        <Route exact path='/admin/notifications/announcement' component={AnnouncementTab} />
                        <Route exact path='/admin/notifications/broadcast' component={BroadcastTab} />
                        <Route exact path='/admin/notifications/:action' component={EditNotificationPage} />
                        <Route exact path='/admin/notifications/broadcast/:action' component={EditBroadcastPage} />
                    </div>
                </Switch>
            </NotificationContext.Provider>
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
