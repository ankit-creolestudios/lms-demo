import React, { Component } from 'react';

interface IProps {
    className: string;
    duration?: number;
    onClick?: () => void;
    dismiss: () => void;
}

interface IState {
    active: boolean;
}

export default class Alert extends Component<IProps, IState> {
    timePassed = 0;
    timeRemaining = 0;
    timeout: ReturnType<typeof setTimeout> | null = null;
    timer: ReturnType<typeof setInterval> | null = null;

    state: IState = {
        active: false,
    };

    constructor(props: IProps) {
        super(props);

        this.timeRemaining = this.props.duration ?? 5000;
    }

    componentDidMount = (): void => {
        this.startTimer();
        setTimeout(() => {
            this.setState({ active: true });
        }, 0);
        this.startTimeout();
    };

    startTimer = (): void => {
        this.timer = setInterval(() => {
            this.timePassed = this.timePassed + 100;
        }, 100);
    };

    startTimeout = (): void => {
        this.timeout = setTimeout(() => {
            this.setState({ active: false });
            this.props.dismiss();
        }, this.timeRemaining);
    };

    hoverStart = (): void => {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }

        if (this.timer !== null) {
            clearTimeout(this.timer);
        }
    };

    hoverEnd = (): void => {
        this.timeRemaining = this.timeRemaining - this.timePassed;
        this.timePassed = 0;
        this.startTimer();
        this.startTimeout();
    };

    render() {
        return (
            <div
                onClick={this.props.onClick}
                onMouseEnter={this.hoverStart}
                onMouseLeave={this.hoverEnd}
                className={`${this.props.className} ${this.state.active ? ' active' : ''}`}
            >
                {this.props.children}
            </div>
        );
    }
}
