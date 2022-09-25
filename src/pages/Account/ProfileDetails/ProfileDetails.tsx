import React, { Component } from 'react';
import { Alert, Col, Modal, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Api, EventBus } from 'src/helpers/new';
import withContext from 'src/helpers/withContext';
import AccountContext, { IAccountContext } from '../AccountContext';

interface IState {
    loading: boolean;
    failedToLoad: boolean | string;
    email: string;
    _id: string;
    firstName: string;
    lastName: string;
    adminLevel: string;
    phoneNumber: string;
    addressLineOne: string;
    addressLineTwo: string;
    townCity: string;
    state: string;
    zipCode: string;
    suspended: string;
    verified: string;
    adminNotes: string;
    timeZone: string;
    showModal: boolean;
    passwordError: string;
    currentPassword: string;
    password: string;
    passwordCheck: string;
    [key: string]: any;
}

interface IProps {
    contextValue: IAccountContext;
    loggedIn: {
        APP_VERSION: string;
        token: string;
        user: any;
    };
}

class ProfileDetails extends Component<IProps, IState> {
    static contextType = AccountContext;

    constructor(props: IProps) {
        super(props);
        this.state = {
            loading: true,
            failedToLoad: false,
            email: '',
            _id: '',
            firstName: '',
            lastName: '',
            adminLevel: '',
            phoneNumber: '',
            addressLineOne: '',
            addressLineTwo: '',
            townCity: '',
            state: '',
            zipCode: '',
            suspended: '',
            verified: '',
            adminNotes: '',
            timeZone: '',
            showModal: false,
            passwordError: '',
            currentPassword: '',
            password: '',
            passwordCheck: '',
        };
    }

    async componentDidMount() {
        this.setState({
            ...this.context.detailsTabData,
            loading: false,
            failedToLoad: this.context.failedToLoadMsg,
        });
    }

    componentDidUpdate = (prevProps: IProps) => {
        if (prevProps.contextValue.detailsTabData !== this.props.contextValue.detailsTabData) {
            this.setState({
                ...this.context.detailsTabData,
                loading: false,
                failedToLoad: this.context.failedToLoadMsg,
            });
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        await Api.call('PUT', '/users/' + this.props.loggedIn.user._id, {
            email: this.state.email,
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            adminLevel: this.state.adminLevel,
            phoneNumber: this.state.phoneNumber,
            addressLineOne: this.state.addressLineOne,
            addressLineTwo: this.state.addressLineTwo,
            townCity: this.state.townCity,
            state: this.state.state,
            zipCode: this.state.zipCode,
            adminNotes: this.state.adminNotes,
            timeZone: this.state.timeZone,
        });
    };

    toggleShowModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (e instanceof Event) {
            e.preventDefault();
        }

        this.setState({
            showModal: !this.state.showModal,
        });
    };

    handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { success, message } = await Api.call('POST', '/users/password/change', {
            currentPassword: this.state.currentPassword,
            password: this.state.password,
            passwordCheck: this.state.passwordCheck,
        });

        if (success) {
            EventBus.dispatch('toast', {
                type: 'success',
                message: message ?? 'Your password was changed!',
            });

            this.toggleShowModal();
        } else {
            this.setState({
                passwordError: message,
            });
        }
    };

    render() {
        const { message, passwordError } = this.state;
        return (
            <section id='user-profile' className='padding--double'>
                <Row>
                    <Col>
                        <h3>Your profile</h3>
                    </Col>
                    <Col
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                        }}
                    >
                        <button className='btn bp' onClick={this.toggleShowModal}>
                            Change password
                        </button>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className={'form' + (message ? ' form--with-error' : '')}>
                            {message && <Alert variant={message.type}>{message.text}</Alert>}
                            <div className='form__content'>
                                <form action='/' onSubmit={this.handleFormSubmit}>
                                    <Row>
                                        <Col>
                                            <div className='form__field'>
                                                <label htmlFor='firstName'>First name</label>
                                                <input
                                                    type='text'
                                                    name='firstName'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.firstName}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='lastName'>Last name</label>
                                                <input
                                                    type='text'
                                                    name='lastName'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.lastName}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='email'>Email</label>
                                                <input
                                                    type='text'
                                                    name='email'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.email}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='phoneNumber'>Phone number</label>
                                                <input
                                                    type='text'
                                                    name='phoneNumber'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.phoneNumber}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='timeZone'>Time zone</label>
                                                <input
                                                    type='text'
                                                    name='timeZone'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.timeZone}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='form__field'>
                                                <label htmlFor='addressLineOne'>Address line 1</label>
                                                <input
                                                    type='text'
                                                    name='addressLineOne'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.addressLineOne}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='addressLineTwo'>Address line 2</label>
                                                <input
                                                    type='text'
                                                    name='addressLineTwo'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.addressLineTwo}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='townCity'>Town / City</label>
                                                <input
                                                    type='text'
                                                    name='townCity'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.townCity}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='state'>State</label>
                                                <input
                                                    type='text'
                                                    name='state'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.state}
                                                />
                                            </div>
                                            <div className='form__field'>
                                                <label htmlFor='zipCode'>zipCode</label>
                                                <input
                                                    type='text'
                                                    name='zipCode'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.zipCode}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <div className='form__buttons'>
                                        <button type='submit' className='btn bp'>
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Modal show={this.state.showModal} onHide={this.toggleShowModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Change password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={'form' + (passwordError ? ' form--with-error' : '')}>
                            {passwordError && <div className='form__error'>{passwordError}</div>}
                            <div className='form__content'>
                                <form action='/' onSubmit={this.handlePasswordChange}>
                                    {this.props.loggedIn.token && (
                                        <div className='form__field'>
                                            <label htmlFor='currentPassword'>Current password</label>
                                            <input
                                                type='password'
                                                name='currentPassword'
                                                onChange={this.handleInputChange}
                                            />
                                        </div>
                                    )}
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
                                            Submit
                                        </button>
                                        <button className='btn bd' onClick={this.toggleShowModal}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </section>
        );
    }
}

export default connect((state: any) => ({
    loggedIn: state?.loggedIn,
}))(withRouter(withContext(ProfileDetails, AccountContext)));
