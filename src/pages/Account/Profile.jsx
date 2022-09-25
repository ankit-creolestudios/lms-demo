import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Nav, Spinner } from 'react-bootstrap';
import UserLayout from '../../layouts/User';
import { Link, Route, Switch, withRouter } from 'react-router-dom';
import ProfileDetails from './ProfileDetails/ProfileDetails';
import ProfileCommissions from './ProfileCommissions/ProfileCommissions';
import ProfileNotifications from './ProfileNotifications/ProfileNotifications';
import ProfileSettings from './ProfileSettings/ProfileSettings';
import AccountContext from './AccountContext';
import { Api } from 'src/helpers/new';
import { getState } from 'src/helpers/localStorage';

class Profile extends Component {
    state = {
        notificationTabData: [],
        detailsTabData: {},
        failedToLoadMsg: '',
    };

    componentDidMount = () => {
        this.fetchUserDetails();
    };

    fetchUserDetails = async () => {
        const { response, message, success } = await Api.call('GET', '/users/' + getState('user')._id);

        if (success) {
            this.setState({
                detailsTabData: response,
                notificationTabData: response?.mailingLists,
            });
        } else {
            this.setState({
                failedToLoadMsg: message,
            });
        }
        return;
    };

    render() {
        const { notificationTabData, detailsTabData, failedToLoadMsg } = this.state;
        const { fetchUserDetails } = this;
        if (this.state.loading) {
            return (
                <div className='center-loading big'>
                    <Spinner animation='border' />
                </div>
            );
        }
        return (
            <div
                style={{
                    padding: '20px',
                    background: '#f5fafd',
                    height: '100%',
                }}
            >
                <AccountContext.Provider
                    value={{
                        notificationTabData,
                        detailsTabData,
                        failedToLoadMsg,
                        fetchUserDetails,
                    }}
                >
                    <UserLayout>
                        {[
                            '/profile/details',
                            '/profile/commissions',
                            '/profile/notifications',
                            '/profile/settings',
                        ].includes(this.props.location.pathname) && (
                            <Nav variant='tabs' activeKey={this.props.location.pathname}>
                                <Nav.Item key='profile'>
                                    <Nav.Link as={Link} eventKey={`/profile/details`} to={`/profile/details`}>
                                        Details
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item key='profile-commissions'>
                                    <Nav.Link as={Link} eventKey={`/profile/commissions`} to={`/profile/commissions`}>
                                        Commissions
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item key='profile-notifications'>
                                    <Nav.Link
                                        as={Link}
                                        eventKey={`/profile/notifications`}
                                        to={`/profile/notifications`}
                                    >
                                        Notifications
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item key='profile-settings'>
                                    <Nav.Link as={Link} eventKey={`/profile/settings`} to={`/profile/settings`}>
                                        Settings
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        )}
                        <Switch>
                            <div
                                style={{
                                    background: '#fff',
                                    padding: '20px',
                                }}
                            >
                                <Route exact path='/profile/details' component={ProfileDetails} />
                                <Route exact path='/profile/commissions' component={ProfileCommissions} />
                                <Route exact path='/profile/notifications' component={ProfileNotifications} />
                                <Route exact path='/profile/settings' component={ProfileSettings} />
                            </div>
                        </Switch>
                    </UserLayout>
                </AccountContext.Provider>
            </div>
        );
    }
}

export default connect(
    (state) => ({
        loggedIn: state.loggedIn,
    }),
    {
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
    }
)(withRouter(Profile));
