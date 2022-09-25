import React, { Component } from 'react';
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { Reporting } from '.';
import Template from './tabs/Templates/Template';

interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
}

interface IRouteProps {
    courseId: string;
}

class ReportingRoutes extends Component<IConnectProps & RouteComponentProps<IRouteProps>, unknown> {
    async componentDidMount() {
        this.props.pushBreadcrumbLink({
            text: `Reporting`,
            path: '/admin/reporting',
        });
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            ext: `Reporting`,
            path: '/admin/reporting',
        });
    }

    render() {
        return (
            <div>
                <Switch>
                    <Route exact path='/admin/reporting/templates/:templateId' component={Template} />
                    <Route path='/admin/reporting' component={Reporting} />
                </Switch>
            </div>
        );
    }
}

export default connect(
    (state) => {
        return {
            //@ts-ignore
            formActions: state.formActions,
            //@ts-ignore
            loggedIn: state.loggedIn,
        };
    },
    {
        setGlobalAlert: (payload: any) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
        pushBreadcrumbLink: (payload: any) => ({
            type: 'PUSH_BREADCRUMB_LINK',
            payload,
        }),
        removeBreadcrumbLink: (payload: any) => ({
            type: 'REMOVE_BREADCRUMB_LINK',
            payload,
        }),
        createFormActions: (payload: any) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
    }
)(withRouter(ReportingRoutes as any));
