import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { History, Templates } from './tabs';
import './Reporting.scss';

interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
}

interface IRouteProps {
    courseId: string;
}

class Reporting extends Component<IConnectProps & RouteComponentProps<IRouteProps>, unknown> {
    render() {
        return (
            <div>
                <Nav variant='tabs' activeKey={this.props.location.pathname}>
                    <Nav.Item key='history'>
                        <Nav.Link as={Link} eventKey={`/admin/reporting`} to={`/admin/reporting`}>
                            Report History
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item key='course'>
                        <Nav.Link as={Link} eventKey={`/admin/reporting/templates`} to={`/admin/reporting/templates`}>
                            Report Templates
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <div className='tab-content pt-4'>
                    <Switch>
                        <Route exact path='/admin/reporting' component={History} />
                        <Route exact path='/admin/reporting/templates' component={Templates} />
                    </Switch>
                </div>
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
)(withRouter(Reporting as any));
