import React, { Component } from 'react';
import { EventBus } from 'src/helpers/new';
import Alert, { IAlert } from './Alerts/Alert';
import Toast, { IToast } from './Alerts/Toasts';
import { nanoid } from 'nanoid';
import './AlertHandler.scss';

interface IState {
    alerts: Record<string, IAlert>;
    toasts: Record<string, IToast>;
}

export default class AlertHandler extends Component<unknown, IState> {
    state: IState = {
        alerts: {},
        toasts: {},
    };

    componentDidMount = () => {
        EventBus.on('api-response', (e: Event) => {
            const response = (e as CustomEvent).detail;
            if (response.success) {
                if (response.notification) {
                    const alert: IAlert | IToast = {
                        id: nanoid(),
                        type: response.notification.type,
                        title: response.notification.title,
                        message: response.notification.message,
                        duration: 2000,
                    };
                    if (alert.title) {
                        this.createAlert(alert);
                    } else {
                        this.createToast(alert);
                    }
                }
            } else {
                const alert: IAlert = {
                    id: nanoid(),
                    type: 'error',
                    title: 'Error',
                    message: response.message,
                    duration: 5000,
                };
                this.createAlert(alert);
            }
        });
        EventBus.on('alert', (e: Event) => {
            const alert = Object.assign({}, (e as CustomEvent).detail);
            alert.id = nanoid();

            this.createAlert(alert);
        });
        EventBus.on('toast', (e: Event) => {
            const alert = Object.assign({}, (e as CustomEvent).detail);
            alert.id = nanoid();

            this.createToast(alert);
        });
    };

    componentWillUnmount = () => {
        EventBus.remove('api-response');
        EventBus.remove('alert');
    };

    createAlert = (alert: IAlert) => {
        this.setState({ alerts: { ...this.state.alerts, [alert.id]: alert } });
    };

    createToast = (alert: IToast) => {
        this.setState({ toasts: { ...this.state.toasts, [alert.id]: alert } });
    };

    dismissAlert = (key: string) => {
        const alerts = { ...this.state.alerts };

        delete alerts[key];
        this.setState({ alerts });
    };

    dismissToast = (key: string) => {
        const toasts = { ...this.state.toasts };

        delete toasts[key];
        this.setState({ toasts });
    };

    render() {
        const { alerts, toasts } = this.state;

        return (
            <>
                <div className='alerts-container'>
                    {Object.values(alerts).map((alert: IAlert) => {
                        return <Alert key={alert.id} alert={alert} dismiss={this.dismissAlert} />;
                    })}
                </div>
                <div className='toasts-container'>
                    {Object.values(toasts).map((toast: IToast) => {
                        return <Toast key={toast.id} toast={toast} dismiss={this.dismissToast} />;
                    })}
                </div>
            </>
        );
    }
}
