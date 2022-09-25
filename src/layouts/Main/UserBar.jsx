import React, { Component } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faBell, faDoorOpen, faGraduationCap, faUser, faUserShield } from '@fortawesome/free-solid-svg-icons';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import apiCall from '../../helpers/apiCall';
import { BiCog, BiBell, BiDoorOpen } from 'react-icons/bi';
import { RiBookletLine, RiLogoutBoxRLine } from 'react-icons/ri';
import { FaUserCircle } from 'react-icons/fa';

class UserBar extends Component {
    eventSource = null;

    state = {
        notificationCount: 0,
        active: false,
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.eventSource === null && this.props.loggedIn.token) {
            this.eventSource = new EventSource(
                `${process.env.REACT_APP_API_URL}/users/notifications?token=` + encodeURI(this.props.loggedIn.token)
            );

            this.eventSource.onmessage = (event) => {
                const { notificationCount } = JSON.parse(event.data);

                this.setState({
                    notificationCount: notificationCount || 0,
                });
            };

            this.eventSource.onerror = () => {
                this.eventSource.close();
            };
        }
    }

    logOut = async () => {
        const { success, message } = await apiCall('POST', '/users/logout');

        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? "You've been successfully logged out.",
            });
            localStorage.removeItem('authToken');
            localStorage.removeItem('reuCheckoutCartId');
            localStorage.removeItem('reuCheckoutCurrentTab');
            this.props.setLoggedIn({
                token: null,
                user: null,
            });

            window.socket.emit('logout');
            this.props.history.push('/login');
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    toggleMenu = () => {
        if (window.innerWidth > 900) {
            return;
        }

        this.setState({
            active: !this.state.active,
        });
    };

    render() {
        if (!this.props.loggedIn.token) {
            return null;
        }
        const { active } = this.state;

        return (
            <>
                <nav id='user-bar' className={active ? ' active' : ''} onClick={this.toggleMenu}>
                    <OverlayTrigger
                        placement='bottom'
                        overlay={<Tooltip id='user-bar__tooltip__courses'>Courses</Tooltip>}
                    >
                        <Link className='user-bar__action' to='/'>
                            <Fa icon={faGraduationCap} />
                        </Link>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement='bottom'
                        overlay={<Tooltip id='user-bar__tooltip__profile'>Profile</Tooltip>}
                    >
                        <Link className='user-bar__action' to='/profile/details'>
                            <Fa icon={faUser} />
                        </Link>
                    </OverlayTrigger>
                    <OverlayTrigger
                        placement='bottom'
                        overlay={
                            <Tooltip id='user-bar__tooltip__notifications'>
                                {this.state.notificationCount === 0
                                    ? 'Notifications'
                                    : this.state.notificationCount +
                                      (this.state.notificationCount === 1
                                          ? ' unread notification'
                                          : ' unread notifications')}
                            </Tooltip>
                        }
                    >
                        <Link className='user-bar__action' to='/notifications/'>
                            <Fa icon={faBell} />
                            {this.state.notificationCount !== 0 && (
                                <div className='user-bar__action__notification'>
                                    {this.state.notificationCount > 9 ? '+' : this.state.notificationCount}
                                </div>
                            )}
                        </Link>
                    </OverlayTrigger>
                    {!!this.props.loggedIn.user.adminLevel && (
                        <OverlayTrigger
                            placement='bottom'
                            overlay={<Tooltip id='user-bar__tooltip__notifications'>Admin Panel</Tooltip>}
                        >
                            <Link className='user-bar__action' to='/admin/'>
                                <Fa icon={faUserShield} />
                            </Link>
                        </OverlayTrigger>
                    )}
                    <OverlayTrigger
                        placement='bottom'
                        overlay={<Tooltip id='user-bar__tooltip__notifications'>Sign Out</Tooltip>}
                    >
                        <span className='user-bar__action' onClick={this.logOut}>
                            <Fa icon={faDoorOpen} />
                        </span>
                    </OverlayTrigger>
                </nav>
            </>
        );
    }
}

export default connect(
    (state) => {
        return { loggedIn: state.loggedIn };
    },
    {
        setLoggedIn: (payload) => ({
            type: 'SET_LOGGED_IN',
            payload,
        }),
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
    }
)(withRouter(UserBar));
