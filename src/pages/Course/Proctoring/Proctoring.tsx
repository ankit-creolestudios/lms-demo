import React, { Component } from 'react';
import CourseContext from 'src/pages/Course/CourseContext';
import BioSig from './BioSig';
import { EventBus } from 'src/helpers/new';
import './Proctoring.scss';

type syncAsyncFunction = (() => void) | (() => Promise<void>);

interface IState {
    requiresAuth: boolean;
    authCallback: syncAsyncFunction;
    stage?: string;
}

export default class Proctoring extends Component<unknown, IState> {
    static contextType = CourseContext;

    state: IState = {
        requiresAuth: false,
        authCallback: () => {},
    };

    componentDidMount() {
        window.socket.on('user-verification-success', this.authSuccess);
        window.socket.on('user-verification-fail', this.authFail);
        window.socket.on('require-auth', this.serverRequireAuth);
        EventBus.on('require-auth', this.requireAuth as any);
    }

    componentWillUnmount() {
        window.socket.off('user-verification-success', this.authSuccess);
        window.socket.off('user-verification-fail', this.authFail);
        window.socket.off('require-auth', this.serverRequireAuth);
        EventBus.remove('require-auth', this.requireAuth as any);
    }

    requireAuth = (event?: Event) => {
        const { stage, callback } = (event as CustomEvent).detail;
        this.setState({ requiresAuth: true, stage, authCallback: callback });
    };

    serverRequireAuth = (stage: string) => {
        this.setState({ requiresAuth: true, stage });
    };

    authSuccess = () => {
        this.setState({ requiresAuth: false }, () => {
            this.state?.authCallback?.();
            this.setState({ authCallback: () => {}, stage: undefined });
        });
    };

    authFail = () => {
        console.log('fail');
    };

    render() {
        const { requiresAuth, stage } = this.state;

        if (!requiresAuth) return null;

        return (
            <div className='course-proctoring'>
                <BioSig stage={stage as string} />
            </div>
        );
    }
}
