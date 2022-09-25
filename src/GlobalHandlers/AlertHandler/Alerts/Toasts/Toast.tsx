import React, { Component } from 'react';
import Alert from '../BaseAlert';
import './Toast.scss';

interface IProps {
    toast: IToast;
    dismiss: (key: string) => void;
}

export interface IToast {
    id: string;
    type: 'error' | 'success' | 'warning' | 'info';
    message: string;
    duration?: number;
}

export default class PopInAlert extends Component<IProps> {
    dismiss = (): void => {
        setTimeout(() => {
            this.props.dismiss(this.props.toast.id);
        }, 500);
    };

    copyAlertToClipboard = (): void => {
        navigator.clipboard.writeText(`${this.props.toast.type} - ${this.props.toast.message}`);
    };

    get alertMessage(): string {
        const { message } = this.props.toast;
        if (message.length > 100) {
            return `${message.substring(0, 100)} ...`;
        } else {
            return message;
        }
    }

    get icon(): string {
        switch (this.props.toast.type) {
            case 'error':
                return 'fas fa-exclamation-triangle';
            case 'success':
                return 'fas fa-check';
            case 'warning':
                return 'fas fa-exclamation-triangle';
            case 'info':
                return 'fas fa-info-circle';
        }
    }

    render() {
        const { type, duration } = this.props.toast;

        return (
            <Alert
                className={`popup-toast ${type}`}
                duration={duration}
                onClick={this.copyAlertToClipboard}
                dismiss={this.dismiss}
            >
                <div className='icon'>
                    <i className={this.icon} onClick={this.dismiss} />
                </div>
                <span>{this.alertMessage}</span>
            </Alert>
        );
    }
}
