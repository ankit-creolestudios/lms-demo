import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';

class ResetPassword extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            sent: false,
            email: null,
        };
    }

    handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!this.state.email) {
            this.setState({
                error: 'Please enter a valid email address',
            });
            return;
        }

        const { message: error, success } = await apiCall('GET', '/users/password/' + this.state.email, null, false);

        if (success) {
            this.setState({
                sent: true,
            });
        } else {
            this.setState({
                error,
            });
        }
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    render() {
        if (this.props.loggedIn.token) {
            return <Redirect to={'/'} />;
        }

        const { error, sent } = this.state;

        return (
            <div className='centered-block'>
                <div className={'form form--narrow form--floating' + (error ? ' form--with-error' : '')}>
                    {error && <div className='form__error'>{error}</div>}
                    <div className='form__content'>
                        <h2>Reset password</h2>
                        <form action='/' onSubmit={this.handleFormSubmit}>
                            <div className='form__message'>
                                {!sent ? (
                                    'Please enter your email address to receive a password reset link.'
                                ) : (
                                    <span>
                                        If an account with the email address you entered exists, you will receive a
                                        reset link to your inbox within 10 minutes.
                                        <br />
                                        <br />
                                        Please check your spam/junk folder before you try again or contact support.
                                    </span>
                                )}
                            </div>
                            {sent ? (
                                ''
                            ) : (
                                <div className='form__field'>
                                    <label htmlFor='email'>Email</label>
                                    <input type='email' name={'email'} onChange={this.handleInputChange} />
                                </div>
                            )}
                            <div className='form__buttons'>
                                <button className={'btn ' + (sent ? 'bd' : 'bp')}>
                                    {sent ? 'Request again' : 'Request'}
                                </button>
                                {sent ? (
                                    <Link to='/support' className='btn btn--link'>
                                        Contact support
                                    </Link>
                                ) : (
                                    <Link to='/login' className='btn btn--link'>
                                        Login
                                    </Link>
                                )}
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
        return {
            loggedIn: state.loggedIn,
        };
    },
    {
        setLoggedIn: (payload) => ({
            type: 'SET_LOGGED_IN',
            payload,
        }),
    }
)(ResetPassword);
