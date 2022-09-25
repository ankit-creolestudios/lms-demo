import React, { Component } from 'react';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import apiCall from '../../helpers/apiCall';

class ChangePassword extends Component {
    state = {
        currentPassword: '',
        password: '',
        passwordCheck: '',
        error: '',
        redirect: '',
    };

    constructor(props) {
        super(props);

        this.searchParams = new URLSearchParams(props.location.search);
    }

    async componentDidMount() {
        const { success, message } = await apiCall(
            'GET',
            '/users/password/token/' + this.searchParams.get('resetToken')
        );

        if (!success) {
            this.setState({
                redirect: '/',
            });

            this.props.setGlobalAlert({
                type: 'error',
                message:
                    message === 'UNAUTHORIZED' ? 'You can not perform that action while you are logged in' : message,
            });
        }
    }

    handleInputChange = (e) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    handleFormSubmit = async (e) => {
        e.preventDefault();

        const { message, success } = await apiCall(
            'POST',
            '/users/password' + (this.props.loggedIn.token ? `/${this.props.loggedIn.user._id}` : ''),
            {
                [this.props.loggedIn.token ? 'currentPassword' : 'resetToken']: this.props.loggedIn.token
                    ? this.state.currentPassword
                    : this.searchParams.get('resetToken'),
                password: this.state.password,
                passwordCheck: this.state.passwordCheck,
            }
        );

        if (success) {
            this.setState({
                error: null,
                redirect: '/login',
            });
        } else {
            this.setState({
                error: message,
            });
        }
    };

    render() {
        const { error } = this.state;

        if (this.searchParams.get('resetToken') === null || this.state.redirect) {
            return <Redirect to={this.state.redirect || '/login'} />;
        }

        return (
            <div className='centered-block'>
                <div className={'form form--narrow form--floating' + (error ? ' form--with-error' : '')}>
                    {error && <div className='form__error'>{error}</div>}
                    <div className='form__content'>
                        <h2>Change password</h2>
                        <form action='/' onSubmit={this.handleFormSubmit}>
                            <div className='form__field'>
                                <label htmlFor='password'>New password</label>
                                <input type='password' name='password' onChange={this.handleInputChange} />
                            </div>
                            <div className='form__field'>
                                <label htmlFor='passwordCheck'>Repeat new password</label>
                                <input type='password' name='passwordCheck' onChange={this.handleInputChange} />
                            </div>
                            <div className='form__buttons'>
                                <button className='btn bp' type='submit'>
                                    Change password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    (state) => {
        return { loggedIn: state.loggedIn };
    },
    {
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
        setLoggedIn: (payload) => ({
            type: 'SET_LOGGED_IN',
            payload,
        }),
    }
)(withRouter(ChangePassword));
