import React, { Component } from 'react';
import SessionsList from './SessionsList';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

class Sessions extends Component {
    constructor(props) {
        super(props);

        props.pushBreadcrumbLink({
            text: 'Sessions',
            path: '/admin/sessions',
        });
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Sessions',
            path: '/admin/sessions',
        });
    }

    render() {
        return (
            <Switch>
                <Route exact path='/admin/sessions' component={SessionsList} />
            </Switch>
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
})(Sessions);
