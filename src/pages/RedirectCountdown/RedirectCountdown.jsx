import React, { Component } from 'react';
import Countdown from 'react-countdown';
import { Redirect } from 'react-router';

export default class RedirectCountdown extends Component {
    state = {
        redirect: false,
    };

    render() {
        const {
            props: { message, countDown, to },
        } = this;

        if (this.state.redirect) {
            return <Redirect to={to} />;
        }

        return (
            <div>
                <h3>{message}</h3>
                <span>
                    Redirecting in&nbsp;
                    <Countdown
                        date={Date.now() + countDown * 1000}
                        renderer={({ hours, minutes, seconds, completed }) => {
                            return <span>{seconds} seconds</span>;
                        }}
                        onComplete={() => {
                            this.setState({
                                redirect: true,
                            });
                        }}
                    />
                </span>
            </div>
        );
    }
}
