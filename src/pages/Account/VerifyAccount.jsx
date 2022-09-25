import React, { Component } from 'react';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import apiCall from '../../helpers/apiCall';

class VerifyAccount extends Component {
    state = {
        redirect: false,
    };
    async componentDidMount() {
        const query = new URLSearchParams(this.props.location.search),
            verifyToken = query.get('verifyToken'),
            { success, message } = await apiCall('GET', `/users/verify/${verifyToken}/`);

        this.setState(
            {
                redirect: true,
            },
            () => {
                const { loggedIn } = this.props;

                this.props.setLoggedIn({
                    token: loggedIn.token,
                    user: {
                        ...loggedIn.user,
                        verified: new Date().toISOString(),
                    },
                });
                this.props.setGlobalAlert({
                    type: success ? 'success' : 'error',
                    message,
                });
            }
        );
    }
    render() {
        return <div>{this.state.redirect && <Redirect to='/' />}</div>;
    }
}

export default connect((state) => ({ loggedIn: state.loggedIn }), {
    setLoggedIn: (payload) => ({
        type: 'SET_LOGGED_IN',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(VerifyAccount));
