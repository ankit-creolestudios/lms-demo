import './Messages.scss';
import MessageForm from './MessageForm';
import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import MessagesList from './MessagesList';
import { connect } from 'react-redux';

class Messages extends Component {
    constructor(props) {
        super(props);

        props.pushBreadcrumbLink({
            text: 'Messages',
            path: '/admin/messages',
        });

        this.sendingConditions = {
            GLOBAL_VARIABLES: ['website.title', 'website.url', 'user.firstName', 'user.lastName', 'user.email'],
            USER_REGISTER: {
                text: 'User registration',
                availableVariables: [],
            },
            USER_COURSE_START: {
                text: 'Course started',
                availableVariables: [],
            },
            USER_COURSE_EXPIRY: {
                text: 'Course expires',
                availableVariables: [],
            },
            USER_EXAM_PASS: {
                text: 'User passes exam',
                availableVariables: [],
            },
            USER_EXAM_FAIL: {
                text: 'User fails exam',
                availableVariables: [],
            },
            COURSE_LESSON_CREATE: {
                text: 'New lesson added to the course',
                availableVariables: [],
            },
        };
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Messages',
            path: '/admin/messages',
        });
    }

    render() {
        return (
            <div id='messages'>
                <Switch>
                    <Route exact path='/admin/messages'>
                        <MessagesList sendingConditions={this.sendingConditions} />
                    </Route>
                    <Route exact path='/admin/messages/:id'>
                        <MessageForm sendingConditions={this.sendingConditions} />
                    </Route>
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
})(Messages);
