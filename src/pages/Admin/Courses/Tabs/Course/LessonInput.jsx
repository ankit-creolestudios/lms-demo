import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import apiCall from '../../../../../helpers/apiCall';

export default class LessonInput extends Component {
    state = {
        editable: false,
        value: this.props.doc[this.props.prop],
    };

    submit = async () => {
        const { success, message } = await apiCall('PATCH', `/${this.props.source}/lessons/${this.props.doc._id}`, {
            [this.props.prop]: this.state.value,
        });
        if (success) {
            this.setState({ editable: false });

            if (this.props.recalculateTotalTimes) {
                this.props.recalculateTotalTimes({
                    ...this.props.doc,
                    [this.props.prop]: this.state.value,
                });
            }
        }

        this.props.setGlobalAlert({
            type: success ? 'success' : 'error',
            message,
        });
    };

    render() {
        return (
            <div className='limitTitle'>
                {this.state.editable ? (
                    this.props.inputField ? (
                        this.props.inputField(this.state.value, (newValue) => {
                            this.setState({
                                value: newValue,
                            });
                        })
                    ) : (
                        <Form.Control
                            className='d-inline-block'
                            type={this.props.type}
                            required
                            minLength={this.props.type === 'text' ? '3' : undefined}
                            maxLength={this.props.type === 'text' ? '512' : undefined}
                            min={this.props.type === 'number' ? '0' : undefined}
                            name={this.props.prop}
                            value={this.state.value}
                            onClick={(event) => {
                                event.stopPropagation();
                            }}
                            onChange={(event) => {
                                this.setState({ value: event.target.value });
                            }}
                        />
                    )
                ) : (
                    <span>
                        {this.props.translateValue ? this.props.translateValue(this.state.value) : this.state.value}
                    </span>
                )}
                {this.state.editable ? (
                    <button
                        type='button'
                        className='btn bp ml-2'
                        onClick={(event) => {
                            event.stopPropagation();
                            this.submit();
                        }}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                ) : (
                    <FontAwesomeIcon
                        onClick={(event) => {
                            event.stopPropagation();
                            this.setState({ editable: true });
                        }}
                        style={{
                            cursor: 'pointer',
                            fontSize: '14px',
                            marginLeft: '7px',
                        }}
                        icon={faPencilAlt}
                    />
                )}
            </div>
        );
    }
}

