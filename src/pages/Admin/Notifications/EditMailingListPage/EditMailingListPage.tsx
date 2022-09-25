import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Link, Route, RouteComponentProps, Switch, withRouter } from 'react-router-dom';
import { getState, setState } from 'src/helpers/localStorage';
import NotificationContext, { ContextType } from '../NotificationContext';
import { IConnectProps } from '../Notifications';
import SetupTab from '../Tabs/SetupTab/SetupTab';
import SubscriberTab from '../Tabs/SubscriberTab/SubscriberTab';
import UnsubscriberTab from '../Tabs/UnsubscriberTab/UnsubscriberTab';
import EditPageHeader from './EditPageHeader';
import './editMailingListPage.scss';
import withContext from 'src/helpers/withContext';

interface IProps extends RouteComponentProps, IConnectProps {
    match: {
        isExact: true;
        path: string;
        url: string;
        params: {
            action: string;
            tab: string;
        };
    };
    contextValue: ContextType;
}

class EditMailingListPage extends Component<IProps, any> {
    static contextType = NotificationContext;

    componentDidMount = async () => {
        const { action } = this.props.match.params;
        if (['add', 'edit'].includes(action)) {
            this.setBreadCrumbs();
            if (action === 'edit') {
                if (!!(getState('selectedMailingListId') || this.context.selectedMailingListId)) {
                    this.context.fetchMailingListData();
                }
            } else {
                this.context.resetSetupForm();
            }
        }
    };

    componentDidUpdate = (prevProps: any) => {
        if (JSON.stringify(prevProps.contextValue.setupForm) !== JSON.stringify(this.props.contextValue.setupForm)) {
            this.setBreadCrumbs();
        }
    };

    componentWillUnmount = () => {
        const { action } = this.props.match.params;
        this.props.removeBreadcrumbLink({
            text: action === 'add' ? 'New Mailing List' : this.context.setupForm?.name,
            path: `/admin/notifications/mailingList/${action}`,
        });
        this.props.removeBreadcrumbLink({
            text: 'Mailing Lists',
            path: '/admin/notifications/mailingList',
        });
        this.props.setFormActions({
            customButtons: [],
        });
        this.context.updateNotificationState('selectedMailingListId', '');
        setState('selectedMailingListId', '');
    };

    setBreadCrumbs = () => {
        const { action } = this.props.match.params;
        this.props.pushBreadcrumbLink({
            text: 'Mailing Lists',
            path: '/admin/notifications/mailingList',
        });
        this.props.pushBreadcrumbLink({
            text: action === 'add' ? 'New Mailing List' : this.context.setupForm?.name,
            path: `/admin/notifications/mailingList/${action}`,
        });
    };

    render() {
        const { action } = this.props.match.params;

        if (!(getState('selectedMailingListId') || this.context.selectedMailingListId) && action === 'edit') {
            this.props.history.push('/admin/notifications/mailingList');
        }

        return (
            [
                `/admin/notifications/mailingList/${action}/setup`,
                `/admin/notifications/mailingList/${action}/subscribers`,
                `/admin/notifications/mailingList/${action}/unsubscribers`,
            ].includes(this.props.location.pathname) && (
                <>
                    <EditPageHeader />
                    <Nav variant='tabs' activeKey={this.props.location.pathname}>
                        <Nav.Item key='setup'>
                            <Nav.Link
                                as={Link}
                                eventKey={`/admin/notifications/mailingList/${action}/setup`}
                                to={`/admin/notifications/mailingList/${action}/setup`}
                            >
                                Setup
                            </Nav.Link>
                        </Nav.Item>
                        {action === 'edit' && (
                            <>
                                <Nav.Item key='subscribers'>
                                    <Nav.Link
                                        as={Link}
                                        eventKey={`/admin/notifications/mailingList/${action}/subscribers`}
                                        to={`/admin/notifications/mailingList/${action}/subscribers`}
                                    >
                                        Subscribers
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item key='unsubscribers'>
                                    <Nav.Link
                                        as={Link}
                                        eventKey={`/admin/notifications/mailingList/${action}/unsubscribers`}
                                        to={`/admin/notifications/mailingList/${action}/unsubscribers`}
                                    >
                                        Unsubscribers
                                    </Nav.Link>
                                </Nav.Item>
                            </>
                        )}
                    </Nav>
                    <div className='tab-content'>
                        <Switch>
                            <Route exact path={`/admin/notifications/mailingList/:action/setup`} component={SetupTab} />
                            <Route
                                exact
                                path={`/admin/notifications/mailingList/:action/subscribers`}
                                component={SubscriberTab}
                            />
                            <Route
                                exact
                                path={`/admin/notifications/mailingList/:action/unsubscribers`}
                                component={UnsubscriberTab}
                            />
                        </Switch>
                    </div>
                </>
            )
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
    setFormActions: (payload: any) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(withRouter(withContext(EditMailingListPage, NotificationContext)));
