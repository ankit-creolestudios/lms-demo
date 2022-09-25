import './MessageForm.scss';
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Alert, Col, Row } from 'react-bootstrap';
import Editor from '../../../components/Editor';
import apiCall from '../../../helpers/apiCall';
import Select from 'react-select-search';
import { connect } from 'react-redux';

class MessageForm extends Component {
    state = {
        _id: null,
        subject: null,
        message: null,
        sendingCondition: 'USER_REGISTER',
        sendingTimeCondition: 'after',
        sendingTime: 0,
        formMessage: null,
        availableVariables: [],
        previousRoute: '/admin/messages',
        editor: null,
    };

    async componentDidMount() {
        if (this.props.match.params.id !== 'new') {
            const { success, message, response } = await apiCall('GET', '/notifications/' + this.props.match.params.id);

            if (success) {
                this.setState({
                    ...response,
                });
            } else {
                this.props.setGlobalAlert({ type: 'error', message });
            }
        }

        this.updateAvailableVariables();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.location.pathname && prevState.previousRoute !== this.state.previousRoute) {
            this.setState({
                previousRoute: prevProps.location.pathname,
            });
        }
    }

    updateAvailableVariables = () => {
        let variables = [...this.props.sendingConditions.GLOBAL_VARIABLES],
            availableVariables = {};

        for (const variable of variables) {
            let group = variable.split('.')[0];

            if (!availableVariables[group]) {
                availableVariables[group] = [variable];
            } else {
                availableVariables[group].push(variable);
            }
        }

        this.setState({
            availableVariables,
        });
    };

    handleFormSubmit = async (e) => {
        e.preventDefault();

        const { success, message } = await apiCall(
            this.props.match.params.id === 'new' ? 'POST' : 'PUT',
            this.props.match.params.id === 'new' ? '/notifications' : '/notifications/' + this.props.match.params.id,
            {
                subject: this.state.subject,
                message: this.state.message,
                sendingCondition: this.state.sendingCondition,
                sendingTimeCondition: this.state.sendingTimeCondition,
                sendingTime: this.state.sendingTime,
            }
        );

        if (success) {
            this.props.history.push(this.state.previousRoute);
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Notification template saved.',
            });
        } else {
            this.setState({
                formMessage: message,
            });
        }
    };

    setEditor = (editor) => {
        this.setState({
            editor,
        });
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    handleTagClick = (e) => {
        const { editor } = this.state;

        if (editor && editor.isFocus()) {
            editor.insertContent({ html: e.target.innerHTML });
        }
    };

    selectSendingConditions = () => {
        return Object.keys(this.props.sendingConditions)
            .filter((value) => value !== 'GLOBAL_VARIABLES')
            .map((value) => {
                return {
                    value,
                    name: this.props.sendingConditions[value].text,
                };
            });
    };

    render() {
        const { formMessage } = this.state;

        return (
            <div className='form-with-variables'>
                <div className={'form' + (formMessage ? ' form--with-error' : '')}>
                    {formMessage && <Alert variant='warning'>{formMessage}</Alert>}
                    <div className='form__content'>
                        <form action='/' onSubmit={this.handleFormSubmit}>
                            <Row>
                                <Col>
                                    <div className='form__field'>
                                        <label htmlFor='subject'>Subject</label>
                                        <input
                                            type='text'
                                            name='subject'
                                            onChange={this.handleInputChange}
                                            defaultValue={this.state.subject}
                                            ref={this.subjectRef}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className='form__field'>
                                        <label htmlFor='message'>Message</label>
                                        <Editor
                                            name='message'
                                            defaultValue={this.state.message}
                                            onChange={this.handleInputChange}
                                            onReady={this.setEditor}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className='form__field'>
                                        <label htmlFor='sendingCondition'>Sending time condition</label>
                                        <Row>
                                            <Col>
                                                <input
                                                    type='number'
                                                    name='sendingTime'
                                                    value={this.state.sendingTime}
                                                    onChange={this.handleInputChange}
                                                />
                                                <small className='color--light'>
                                                    The amount of time (in seconds) after/before sending the
                                                    notification.
                                                </small>
                                            </Col>
                                            <Col>
                                                <Select
                                                    name='sendingTimeCondition'
                                                    onChange={(sendingTimeCondition) => {
                                                        this.setState({
                                                            sendingTimeCondition,
                                                        });
                                                    }}
                                                    defaultValue={this.state.sendingTimeCondition}
                                                    options={[
                                                        {
                                                            value: 'after',
                                                            name: 'after',
                                                        },
                                                        {
                                                            value: 'before',
                                                            name: 'before',
                                                        },
                                                    ]}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <div className='form__field'>
                                        <label htmlFor='sendingCondition'>Sending condition</label>
                                        <Select
                                            name='sendingCondition'
                                            search
                                            onChange={(sendingCondition) => {
                                                this.setState({
                                                    sendingCondition,
                                                });
                                            }}
                                            defaultValue={this.state.sendingCondition}
                                            options={this.selectSendingConditions()}
                                        />
                                    </div>
                                </Col>
                            </Row>
                            <div className='form__buttons'>
                                <button type='submit' className='btn bp'>
                                    Save
                                </button>
                                <Link to={this.state.previousRoute} className='btn btn--link'>
                                    Cancel
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
                <aside className='sticky-variables'>
                    <nav>
                        <div>
                            <div className='block-title'>Available tags</div>
                            <small>
                                These tags can be used either in the subject or content of the message. Clicking on any
                                tag will automatically insert it at the cursor position in the content editor.
                            </small>
                        </div>
                        <ul>
                            {this.state.availableVariables &&
                                Object.keys(this.state.availableVariables).map((group) => {
                                    let arr = [];

                                    for (const variable of this.state.availableVariables[group]) {
                                        arr.push(
                                            <li key={variable} onClick={this.handleTagClick}>{`#{${variable}}`}</li>
                                        );
                                    }

                                    return (
                                        <li key={group}>
                                            <b>{group}</b>
                                            <ul>{arr}</ul>
                                        </li>
                                    );
                                })}
                        </ul>
                    </nav>
                </aside>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(MessageForm));
