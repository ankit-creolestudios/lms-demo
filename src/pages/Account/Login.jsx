import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import apiCall from '../../helpers/apiCall';
import { connect } from 'react-redux';
import { io } from 'socket.io-client';
import { EventBus } from 'src/helpers/new';

class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            previousPath: '/',
        };
    }

    componentDidMount() {
        if (this.props.location.state && this.props.location.state.previousPath) {
            this.setState({
                previousPath: this.props.location.state.previousPath,
            });
        }
    }

    handleFormSubmit = async (e) => {
        e.preventDefault();
        this.login(this.state.email, this.state.password);
    };

    login = async (email, password) => {
        const { response, message, success } = await apiCall(
            'POST',
            '/users/login',
            {
                email,
                password,
                browserAgent: navigator.userAgent,
            },
            false,
            false
        );

        if (success) {
            this.setState({
                error: null,
            });
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('APP_VERSION', response.APP_VERSION);
            //TODO : Need to handle in routeguard once role based access contorl is implementated
            const isUserAdmin = response.user.adminLevel === 1;
            const isAdminPreviousPathExists = this.state.previousPath.includes('admin');
            if (!isUserAdmin && isAdminPreviousPathExists) {
                this.setState({ previousPath: '/' });
            } else if (isUserAdmin && !isAdminPreviousPathExists) {
                this.setState({ previousPath: '/' });
            }
            this.props.setLoggedIn(response);

            window.socket = io(process.env.REACT_APP_WS_URL, {
                query: {
                    token: response.token,
                },
            });
        } else {
            this.setState({
                error: message,
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
            return <Redirect to={this.state.previousPath} />;
        }

        const { error } = this.state;

        return (
            <div className='centered-block'>
                <div className={'form form--narrow form--floating' + (error ? ' form--with-error' : '')}>
                    {error && <div className='form__error'>{error}</div>}
                    <div className='form__content'>
                        <h2>Login</h2>
                        <form action='/' onSubmit={this.handleFormSubmit}>
                            <div className='form__field'>
                                <label htmlFor='email'>Email</label>
                                <input type='email' name={'email'} onChange={this.handleInputChange} />
                            </div>
                            <div className='form__field'>
                                <label htmlFor='password'>Password</label>
                                <input type='password' name={'password'} onChange={this.handleInputChange} />
                            </div>
                            <div className='form__message'>
                                By logging in, you are agreeing to the following&nbsp;
                                <Link to='/terms_of_service'>Terms of Service</Link>
                                &nbsp;and our&nbsp;
                                <Link to='/privacy_policy'>Privacy Policy</Link>.
                            </div>
                            <div className='form__buttons'>
                                <button type='submit' className='btn bp'>
                                    Login
                                </button>
                                <Link to='/reset-password' className='btn btn--link'>
                                    Forgot your password?
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}

/*The connect() function connects a React component to a Redux store. It provides the component
with the data it needs from the store.*/

//map state selects the state from the store
const mapState = (state) => {
    // state argument is the entire redux store
    return { loggedIn: state.loggedIn };
};

export default connect(mapState, {
    setLoggedIn: (payload) => ({
        type: 'SET_LOGGED_IN',
        payload,
    }),
})(Login);
