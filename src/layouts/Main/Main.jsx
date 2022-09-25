import './Main.scss';
import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import UserBar from './UserBar';
import { Alert, Spinner } from 'react-bootstrap';
import { io } from 'socket.io-client';

class Main extends Component {
    state = {
        loading: true,
        globalAlert: null,
        showGlobalAlert: false,
        verifyEmailAlert: true,
    };

    regexPublicUrls = [
        /^\/login$/,
        /^\/reset-password$/,
        /^\/change-password$/,
        /^\/terms_of_service$/,
        /^\/privacy_policy$/,
        /^\/checkout\/[a-zA-Z0-9/]*$/,
    ];

    async componentDidMount() {
        const token = localStorage.getItem('authToken');

        if (token && !this.props.loggedIn.token) {
            const { success, response } = await apiCall('POST', '/users/auth', null, false, token);
            this.unsetGlobalAlertTimeout = null;
            if (success) {
                this.props.setLoggedIn(response);
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('APP_VERSION', response.APP_VERSION);
            }


            window.socket = io(process.env.REACT_APP_WS_URL, {
                query: {
                    token,
                },
                secure: process.env.NODE_ENV !== 'development',
            });
        } else if (!token && !this.props.loggedIn.token) {
            window.socket = io(process.env.REACT_APP_WS_URL, {
                secure: process.env.NODE_ENV !== 'development',
            });
        }

        this.setState({
            loading: false,
        });
    }

    dismissVerifyEmail = () => {
        this.setState({
            verifyEmailAlert: false,
        });
    };

    resendEmail = async () => {
        const { success, message } = await apiCall('GET', '/users/verify/resend');

        this.props.setGlobalAlert({
            type: success ? 'success' : 'error',
            message,
        });
    };

    updateGlobalAlert = (globalAlert) => {
        this.setState(
            {
                globalAlert: globalAlert,
            },
            () => {
                this.setState({
                    showGlobalAlert: true,
                });

                setTimeout(() => {
                    this.setState(
                        {
                            showGlobalAlert: false,
                        },
                        () => {
                            this.unsetGlobalAlertTimeout = setTimeout(() => {
                                this.props.unsetGlobalAlert();
                            }, 250);
                        }
                    );
                }, 2750);
            }
        );
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            !!this.props.globalAlert &&
            !!this.props.globalAlert.message &&
            (!this.state.globalAlert || this.state.globalAlert.ts !== this.props.globalAlert.ts)
        ) {
            const currentTs = this.state.globalAlert && this.state.globalAlert.ts ? this.state.globalAlert.ts : 0,
                tsDiff = this.props.globalAlert.ts - currentTs;
            if (tsDiff < 2000) {
                if (this.unsetGlobalAlertTimeout) {
                    clearTimeout(this.unsetGlobalAlertTimeout);
                }

                setTimeout(() => {
                    this.updateGlobalAlert(this.props.globalAlert);
                }, tsDiff);
            } else {
                this.updateGlobalAlert(this.props.globalAlert);
            }
        }
    }

    render() {
        let mainContent;

        if (this.state.loading) {
            mainContent = (
                <div className='center-loading big'>
                    <Spinner animation='border' />
                </div>
            );
        } else {
            if (
                !this.props.loggedIn.token &&
                !this.regexPublicUrls.some((regex) => regex.test(this.props.location.pathname))
            ) {
                return (
                    <Redirect
                        to={{
                            pathname: '/login',
                            state: {
                                previousPath: this.props.location.pathname,
                            },
                        }}
                    />
                );
            } else {
                mainContent = this.props.children;
            }
        }
        return (
            <div className='wrapper'>
                <header>
                    <Link to='/'>
                        <img className='logo-img' src={'/logo.png'} alt='RealEstateU logo' />
                    </Link>
                    <UserBar />
                </header>
                {this.state.verifyEmailAlert && !!this.props.loggedIn.user && !this.props.loggedIn?.user?.verified && (
                    <div className='verify-email'>
                        <Alert variant='danger' onClose={this.dismissVerifyEmail} dismissible>
                            <Alert.Heading>Verify your e-mail address</Alert.Heading>
                            <p>
                                We have sent an validation link to the address provided by you in the registration
                                process to confirm your e-mail address. Did you not get any e-mail? Be sure to check
                                spam or junk folders or&nbsp;
                                <b onClick={this.resendEmail}>click here to resend e-mail verification.</b>
                            </p>
                        </Alert>
                    </div>
                )}
                <main>{mainContent}</main>
                {this.state.globalAlert && (
                    <div
                        className={
                            `global-alert global-alert--${this.state.globalAlert.type}` +
                            (this.state.showGlobalAlert ? ' global-alert--visible' : '')
                        }
                    >
                        {this.state.globalAlert.type === 'success' && <Fa icon={faCheckCircle} />}
                        {this.state.globalAlert.type === 'error' && <Fa icon={faTimesCircle} />}
                        <span
                            className='message'
                            dangerouslySetInnerHTML={{
                                __html: this.state.globalAlert.message,
                            }}
                        ></span>
                    </div>
                )}
            </div>
        );
    }
}

export default connect((state) => ({ loggedIn: state.loggedIn, globalAlert: state.globalAlert }), {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
    setLoggedIn: (payload) => ({
        type: 'SET_LOGGED_IN',
        payload,
    }),
    unsetGlobalAlert: () => ({
        type: 'UNSET_GLOBAL_ALERT',
    }),
})(withRouter(Main));
