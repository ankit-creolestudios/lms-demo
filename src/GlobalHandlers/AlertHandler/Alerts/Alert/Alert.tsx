import React, { Component } from 'react';
import Alert from '../BaseAlert';
import './Alert.scss';

interface IProps {
    alert: IAlert;
    dismiss: (key: string) => void;
}

export interface IAlert {
    id: string;
    type: 'error' | 'success' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
}

interface IState {
    expanded: boolean;
}

export default class CentralAlert extends Component<IProps, IState> {
    state: IState = {
        expanded: false,
    };

    get alertMessage(): string {
        const { message } = this.props.alert;
        const { expanded } = this.state;

        if (message.length > 200 && !expanded) {
            return `${message.substring(0, 200)} ...`;
        } else {
            return message;
        }
    }

    dismiss = (): void => {
        setTimeout(() => {
            this.props.dismiss(this.props.alert.id);
        }, 500);
    };

    toggleExpanded = (): void => {
        this.setState({ expanded: !this.state.expanded });
    };

    copyAlertToClipboard = (): void => {
        navigator.clipboard.writeText(`${this.props.alert.type} - ${this.props.alert.message}`);
    };

    render() {
        const { title, message, type } = this.props.alert;
        const { expanded } = this.state;

        return (
            <Alert
                className='popup-alert'
                duration={this.props.alert.duration}
                onClick={this.copyAlertToClipboard}
                dismiss={this.dismiss}
            >
                <div className={`colour-bar ${type}`}></div>
                <div className='alert-content'>
                    <div className='title'>
                        <span>{title}</span>
                        <i className='fas fa-times' onClick={this.dismiss} />
                    </div>
                    <div className='message'>
                        <span>{this.alertMessage}</span>
                    </div>
                    {message.length > 150 && (
                        <div className='resize' onClick={this.toggleExpanded}>
                            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`} />
                        </div>
                    )}
                </div>
            </Alert>
        );
    }
}
