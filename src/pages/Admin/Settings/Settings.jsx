import React, { Component } from 'react';
import { Nav } from 'react-bootstrap';
import { Link, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import GeneralSettings from './GeneralSettings';
import TermsSettings from './TermsSettings';
import { connect } from 'react-redux';

class Settings extends Component {
    constructor(props) {
        super(props);

        props.pushBreadcrumbLink({
            text: 'Settings',
            path: '/admin/settings',
        });
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Settings',
            path: '/admin/settings',
        });
    }

    render() {
        return (
            <div id='admin-settings'>
                <Nav variant='tabs' as='nav' defaultActiveKey={this.props.location.pathname.split('/')[3]}>
                    <Nav.Item>
                        <Nav.Link eventKey='general' as={Link} to='/admin/settings/general'>
                            General
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey='terms' as={Link} to='/admin/settings/terms'>
                            Terms of Service
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey='privacy' as={Link} to='/admin/settings/privacy'>
                            Privacy Policy
                        </Nav.Link>
                    </Nav.Item>
                </Nav>
                <div className='padding'>
                    <Switch>
                        <Route exact path='/admin/settings/general' component={GeneralSettings} />
                        <Route exact path='/admin/settings/terms' key='terms_of_service'>
                            <TermsSettings title='Terms Of Service' settingKey='terms_of_service' />
                        </Route>
                        <Route exact path='/admin/settings/privacy' key='privacy_policy'>
                            <TermsSettings title='Privacy Policy' settingKey='privacy_policy' />
                        </Route>
                        <Redirect exact from='/admin/settings/' to='/admin/settings/general' />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(Settings));
