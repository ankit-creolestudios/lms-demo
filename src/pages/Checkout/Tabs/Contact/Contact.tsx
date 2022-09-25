import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Api, EventBus } from 'src/helpers/new';
import { RootState } from 'src/store/reducers/rootReducer';
import CheckoutContext from '../../CheckoutContext';
import Next from '../../Next';

type TProps = RouteComponentProps & IConnectProps;

interface IConnectProps {
    loggedIn: any;
}

interface IContact {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

interface IState {
    contact: IContact;
    validation: {
        firstNameMessage: string;
        lastNameMessage: string;
        emailMessage: string;
        phoneNumberMessage: string;
    };
}

class Contact extends Component<TProps, IState> {
    static contextType = CheckoutContext;

    constructor(props: TProps, context: any) {
        super(props);
        this.state = {
            contact: context.contact,
            validation: {
                firstNameMessage: '',
                lastNameMessage: '',
                emailMessage: '',
                phoneNumberMessage: '',
            },
        };
    }

    componentDidMount() {
        EventBus.on('validate-contact-tab', this.validateInputs);
    }

    componentWillUnmount() {
        EventBus.remove('validate-contact-tab', this.validateInputs);
    }

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const contact = { ...this.state.contact };
        contact[e.target.name as keyof IContact] =
            e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value;
        this.setState({ contact });
    };

    validateInputs = async () => {
        let proceed = true;
        const messages = { ...this.state.validation };
        const { firstName, lastName, email, phoneNumber } = this.state.contact;

        if (!email) {
            messages.emailMessage = 'Email cannot be empty.';
            proceed = false;
        } else if (email.length < 5) {
            messages.emailMessage = 'Email too short';
            proceed = false;
        } else if (email.length > 128) {
            messages.emailMessage = 'Email too long';
            proceed = false;
        } else if (!this.validateEmail(email)) {
            messages.emailMessage = 'Invalid email.';
            proceed = false;
        } else {
            const { inUse, canUse } = await this.checkEmail(email);
            if (inUse && !canUse) {
                messages.emailMessage = 'Email Already Registered';
                proceed = false;
            }
        }

        if (!firstName) {
            messages.firstNameMessage = 'First Name cannot be empty.';
            proceed = false;
        } else if (firstName.length < 5) {
            messages.firstNameMessage = 'First name too short';
            proceed = false;
        } else if (firstName.length > 128) {
            messages.firstNameMessage = 'First name too long';
            proceed = false;
        }
        if (!lastName) {
            messages.lastNameMessage = 'Last Name cannot be empty.';
            proceed = false;
        } else if (lastName.length < 5) {
            messages.lastNameMessage = 'Last name too short';
            proceed = false;
        } else if (lastName.length > 128) {
            messages.lastNameMessage = 'Last name too long';
            proceed = false;
        }
        if (!phoneNumber) {
            messages.phoneNumberMessage = 'Phone Number cannot be empty.';
            proceed = false;
        }
        if (proceed) {
            await this.context.updateCart({ contact: this.state.contact });
            this.context.switchTab(2, true);
        } else {
            this.setState({
                validation: messages,
            });
        }
    };

    validateEmail = (email: string) => {
        const re =
            /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
        return re.test(email);
    };

    checkEmail = async (email: string) => {
        const userId = this.props.loggedIn?.user?._id ?? '';
        const { response } = await Api.call('post', '/checkout/cart/createAccount/checkEmail', { email, userId });

        let inUse = false,
            canUse = true;
        if (response.userExists) {
            inUse = true;
            canUse = false;
        }

        if (response.userIsLoggedIn) {
            canUse = true;
        }
        return {
            inUse,
            canUse,
        };
    };

    redirectLogin = () => {
        localStorage.removeItem('authToken');

        window.location.href = '/login';
    };

    render() {
        const { firstName, lastName, email, phoneNumber } = this.state.contact;
        const { firstNameMessage, lastNameMessage, emailMessage, phoneNumberMessage } = this.state.validation;

        return (
            <>
                <div className='checkout-contact'>
                    <h1>Contact info</h1>
                    <h3>Who is this for?</h3>
                    <div className='checkout-form'>
                        <div>
                            <label htmlFor='cFirstName'>First name *</label>
                            <input
                                type='text'
                                value={firstName}
                                onChange={this.handleInputChange}
                                name='firstName'
                                id='cFirstName'
                            />
                            <p>{firstNameMessage}</p>
                        </div>
                        <div>
                            <label htmlFor='cLastName'>Last name *</label>
                            <input
                                type='text'
                                value={lastName}
                                onChange={this.handleInputChange}
                                name='lastName'
                                id='cLastName'
                            />
                            <p>{lastNameMessage}</p>
                        </div>
                        <div>
                            <label htmlFor='cEmail'>Email *</label>
                            <input
                                type='email'
                                value={email}
                                onChange={this.handleInputChange}
                                name='email'
                                id='cEmail'
                            />
                            <p>{emailMessage}</p>
                            {emailMessage === 'Email Already Registered' ? (
                                <p onClick={this.redirectLogin} className='login-link'>
                                    Login to your account
                                </p>
                            ) : (
                                ''
                            )}
                        </div>

                        <div>
                            <label htmlFor='cPhoneNumber'>Phone Number *</label>
                            <input
                                min='1'
                                style={{
                                    background: '#fff',
                                    border: 0,
                                    borderRadius: 0,
                                    padding: '20px 25px',
                                }}
                                type='number'
                                value={phoneNumber}
                                onChange={this.handleInputChange}
                                onKeyPress={(event) => {
                                    if (!/[0-9]/.test(event.key)) {
                                        event.preventDefault();
                                    }
                                }}
                                name='phoneNumber'
                                id='cPhoneNumber'
                            />
                            <p>{phoneNumberMessage}</p>
                        </div>
                    </div>
                </div>
                <Next onClick={this.validateInputs} />
            </>
        );
    }
}

export default connect((state: RootState) => {
    return {
        loggedIn: state.loggedIn,
    };
})(withRouter(Contact));
