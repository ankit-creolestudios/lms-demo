import React, { Component } from 'react';
import { Dropdown, Modal, Spinner } from 'react-bootstrap';
import { connect } from 'react-redux';
import apiCall from '../../../helpers/apiCall';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import Editor from '../../../components/Editor';

class UserActions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            suspended: props.suspended,
            verified: props.verified,
            showModal: false,
            newPassword: '',
            passwordCheck: '',
            passwordLoading: null,
            passwordError: null,
            CKEditor: null,
            value: '<p>This email was triggered in our system by an admin at your request.</p>',
        };
    }

    suspendAccount = async (e) => {
        e.preventDefault();

        const { success, message } = await apiCall('POST', '/users/' + this.props.userId + '/suspend');

        if (success) {
            this.props.setGlobalAlert({ type: 'success', message });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }

        this.setState((state) => {
            return {
                suspended: !state.suspended,
            };
        });
    };

    verifyAccount = async (e) => {
        e.preventDefault();

        const { success, message } = await apiCall('POST', '/users/' + this.props.userId + '/verify');

        if (!success) {
            this.props.setGlobalAlert({ type: 'success', message });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }

        this.setState((state) => {
            return {
                verified: !state.verified,
            };
        });
    };

    handleCKEditorChange = (e) => {
        const { value } = e.target;

        this.setState({
            value,
        });
    };

    setCKEditor = (CKEditor) => {
        this.setState({
            CKEditor,
        });
    };

    handleFormSubmit = async (e) => {
        e.preventDefault();
        this.setState({
            passwordLoading: 'loading',
        });
        const { success, message } = await apiCall('POST', '/users/password/id/' + this.props.userId, {
            message: this.state.value,
        });

        if (success) {
            this.setState(
                {
                    passwordLoading: 'success',
                },
                () => {
                    setTimeout(() => {
                        this.toggleShowModal();
                        this.props.setGlobalAlert({ type: 'success', message });
                    }, 500);
                }
            );
        } else {
            this.setState(
                {
                    passwordLoading: 'fail',
                },
                () => {
                    this.setState(
                        {
                            passwordError: message,
                        },
                        () => {
                            setTimeout(() => {
                                this.setState({
                                    passwordLoading: null,
                                });
                            }, 500);
                        }
                    );
                }
            );
        }
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    toggleShowModal = () => {
        this.setState({
            showModal: !this.state.showModal,
        });
    };

    render() {
        const { passwordError } = this.state;

        return (
            <div id='user-actions'>
                <Dropdown>
                    <Dropdown.Toggle as={'button'} className='btn bd'>
                        User actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu alignRight={true}>
                        {!this.state.verified && (
                            <Dropdown.Item onClick={this.verifyAccount}>Verify account</Dropdown.Item>
                        )}
                        <Dropdown.Item onClick={this.suspendAccount}>
                            {this.state.suspended ? 'Activate account' : 'Suspend account'}
                        </Dropdown.Item>
                        <Dropdown.Item onClick={this.toggleShowModal}>Send password reset email</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Modal show={this.state.showModal} onHide={this.toggleShowModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Send password reset email</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={'form' + (passwordError ? ' form--with-error' : '')}>
                            {passwordError && <div className='form__error'>{passwordError}</div>}
                            <div className='form__content'>
                                <form action='/' onSubmit={this.handleFormSubmit}>
                                    <div className='form__fields'>
                                        <div className='form__field'>
                                            <label htmlFor='message'>Additional message</label>
                                            <Editor
                                                name='message'
                                                defaultValue={this.state.value}
                                                onChange={this.handleCKEditorChange}
                                            />
                                        </div>
                                    </div>
                                    <div className='form__buttons'>
                                        <button
                                            type='submit'
                                            disabled={this.state.passwordLoading !== null}
                                            className='btn bp'>
                                            {this.state.passwordLoading === 'loading' && (
                                                <Spinner
                                                    as='span'
                                                    animation='border'
                                                    size='sm'
                                                    role='status'
                                                    aria-hidden='true'
                                                />
                                            )}
                                            {this.state.passwordLoading === 'success' && <Fa icon={faCheckCircle} />}
                                            {this.state.passwordLoading === 'fail' && <Fa icon={faTimesCircle} />}
                                            {this.state.passwordLoading !== null && <span>&nbsp;</span>}
                                            Save
                                        </button>
                                        <span className='btn btn--link' onClick={this.toggleShowModal}>
                                            Cancel
                                        </span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(UserActions);
