import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import NotificationContext from '../NotificationContext';
import { IConnectProps } from '../Notifications';
import BroadcastContent from './BroadcastContent';
import './broadcastForm.scss';
import BroadcastSetup from './BroadcastSetup';

interface IProps {}

interface IState {}

export default class BroadcastForm extends Component<IProps, IState> {
    static contextType = NotificationContext;

    render() {
        return (
            <div className='broadcast-form'>
                <BroadcastSetup />
                <BroadcastContent />
            </div>
        );
    }
}
