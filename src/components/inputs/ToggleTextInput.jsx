import React, { Component } from 'react';
import { AiFillEdit, AiFillSave, AiOutlineClose } from 'react-icons/ai';
import './ToggleTextInput.scss';

export default class ToggleTextInput extends Component {
    state = {
        isReadOnly: true,
        initialValue: '',
    };

    toggleReadOnly = (e) => {
        e.stopPropagation();

        const { isReadOnly } = this.state,
            newState = {
                isReadOnly: !isReadOnly,
            };

        if (isReadOnly) {
            newState.initialValue = this.props.value;
        } else {
            this.props.onChange({
                target: {
                    name: this.props.name,
                    value: this.state.initialValue,
                },
            });
            newState.initialValue = '';
        }

        this.setState(newState);
    };

    handleOnSave = (e) => {
        e.stopPropagation();

        this.props.onSave({
            target: {
                name: this.props.name,
                value: this.props.value,
            },
        });

        this.setState({
            isReadOnly: true,
            initialValue: '',
        });
    };

    render() {
        const { name, value, onChange } = this.props,
            { isReadOnly } = this.state;

        return (
            <div className='toggle-text-input-component'>
                <input
                    type='text'
                    name={name}
                    style={{ width: `calc(${value?.length ?? 1}ch + 30px)` }}
                    value={value}
                    onChange={onChange}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    readOnly={isReadOnly}
                />
                {isReadOnly ? (
                    <AiFillEdit onClick={this.toggleReadOnly} />
                ) : (
                    <>
                        <AiFillSave onClick={this.handleOnSave} />
                        <AiOutlineClose onClick={this.toggleReadOnly} />
                    </>
                )}
            </div>
        );
    }
}
