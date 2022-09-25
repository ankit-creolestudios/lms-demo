import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import UsersList from './UsersList';
import User from './User';
import UserProgress from './UserProgress';

class Users extends Component {
    constructor(props) {
        super(props);

        props.pushBreadcrumbLink({
            text: 'Users',
            path: '/admin/users',
        });
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Users',
            path: '/admin/users',
        });
    }

    render() {
        return (
            <div id='users'>
                <Switch>
                    <Route exact path='/admin/users' component={UsersList} />
                    <Route path='/admin/users/:userId/course/:courseId/progress' component={UserProgress} />
                    <Route path='/admin/users/:id' component={User} />
                </Switch>
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
})(Users);
