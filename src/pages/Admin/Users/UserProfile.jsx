import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert, Col, Row } from 'react-bootstrap';
import apiCall from '../../../helpers/apiCall';
import { createFormActions } from '../../../store/actions/formActions';
import { Api } from 'src/helpers/new';

class UserProfile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: null,
            initialUser: { ...props.user, addressLineOne: null },
            ...props.user,
            allPermissionGroups: [],
        };
    }

    componentDidMount = async () => {
        this.props.createFormActions({
            save: true,
            id: 'user-profile-form',
        });
        const { success, response } = await Api.call('GET', '/users/permission-groups/list');
        if (success) {
            this.setState({
                allPermissionGroups: response,
            });
        }
    };

    componentWillUnmount() {
        this.props.createFormActions({});
    }

    // we don't need to send everything to the backend, just what's changed
    toUpdate = () => {
        let toReturn = {};
        for (const key of Object.keys(this.state.initialUser)) {
            if (this.state[key] !== this.state.initialUser[key]) {
                toReturn[key] = this.state[key];
            }
        }
        return toReturn;
    };

    handleFormSubmit = async (e) => {
        e.preventDefault();

        const payload = this.toUpdate(),
            message = {
                type: 'success',
                text: 'User updated',
            };

        if (!payload) {
            this.setState({
                message: {
                    type: 'success',
                    text: 'User updated',
                },
            });
        } else {
            const { success, message: responseMessage } = await apiCall(
                'PUT',
                '/users/' + this.state.initialUser._id,
                payload
            );
            message.text = responseMessage;
            if (!success) {
                message.type = 'warning';
            }
        }

        this.setState({
            message,
        });
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    render() {
        const { message } = this.state;
        return (
            <section id='user-profile'>
                <div className='pt-3'>
                    <span>
                        <b>Account ID: </b>
                        {this.state._id
                            .toLocaleUpperCase()
                            .substr(0, 16)
                            .replace(/([A-Z0-9]{4})([A-Z0-9]{4})([A-Z0-9]{4})([A-Z0-9]{4})/, '$1-$2-$3-$4')}
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span>
                        <b>Student ID: </b>
                        {this.state._id
                            .toLocaleUpperCase()
                            .substr(-8)
                            .replace(/([A-Z0-9]{2})([A-Z0-9]{2})([A-Z0-9]{2})([A-Z0-9]{2})/, '$1-$2-$3-$4')}
                    </span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span>
                        <b>Email address: </b>
                        {this.state.email.toLowerCase()}
                    </span>
                    <hr />
                </div>
                <div className={'form form--two-cols' + (message ? ' form--with-error' : '')}>
                    {message && <Alert variant={message.type}>{message.text}</Alert>}
                    <div className='form__content py-1'>
                        <form action='/' id='user-profile-form' onSubmit={this.handleFormSubmit}>
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
                                    {this.state.userRole !== 'student' && (
                                        <div className='form__field'>
                                            <label htmlFor='permissionGroupId'>Permission Group</label>
                                            <select
                                                name='permissionGroupId'
                                                onChange={this.handleInputChange}
                                                value={this.state.permissionGroupId}
                                            >
                                                <option value='' selected disabled hidden>
                                                    Choose Option
                                                </option>
                                                {this?.state?.allPermissionGroups
                                                    .filter(
                                                        (data) =>
                                                            data.groupOrder >=
                                                            JSON.parse(localStorage.getItem('user'))
                                                                .userGroupPermissions?.groupOrder
                                                    )
                                                    .sort((a, b) => a.groupOrder - b.groupOrder)
                                                    .map((grp) => (
                                                        <option value={grp._id}>{grp.groupName}</option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}
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
                                <Col>
                                    <div className='form__field'>
                                        <label htmlFor='adminNotes'>Admin notes</label>
                                        <textarea
                                            name='adminNotes'
                                            onChange={this.handleInputChange}
                                            defaultValue={this.state.adminNotes}
                                            rows='6'
                                            style={{
                                                minHeight: '6rem',
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </form>
                    </div>
                </div>
            </section>
        );
    }
}

const mapDispatchToProps = {
    createFormActions,
};
export default withRouter(connect(null, mapDispatchToProps)(UserProfile));
