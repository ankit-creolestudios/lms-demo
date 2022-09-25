import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import UserLayout from '../../layouts/User';

export default class User extends Component {
    render() {
        return (
            <Switch>
                <UserLayout>test</UserLayout>
            </Switch>
        );
    }
}
