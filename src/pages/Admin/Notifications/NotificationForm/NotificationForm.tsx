import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import NotificationContext from '../NotificationContext';
import { IConnectProps } from '../Notifications';
import NotificationContent from './NotificationContent';
import './notificationForm.scss';
import NotificationSetup from './NotificationSetup';

interface IProps {}

interface IState {}

export default class NotificationForm extends Component<IProps, IState> {
    static contextType = NotificationContext;

    render() {
        return (
            <div className='notification-form'>
                <NotificationSetup />
                <NotificationContent />
            </div>
        );
    }
}
