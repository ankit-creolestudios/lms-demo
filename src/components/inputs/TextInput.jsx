import { camelCase } from 'lodash';
import React, { Component } from 'react';
import './TextInput.scss';

export default class TextInput extends Component {
    state = {
        charCount: this.props?.defaultValue?.length ?? 0,
    };

    componentDidMount() {
        let val = this.props.defaultValue ?? this.props.value ?? '';
        this.setState({ charCount: val.length });
    }

    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ charCount: value.length });
        this.props?.onChange?.(e, value);
    };

    render() {
        return (
            <>
                {this.props?.name && <label htmlFor={camelCase(this.props?.name)}>{this.props?.name}</label>}
                <input
                    className={(this.props?.className + ' ' ?? '') + 'text-input-component-char-count'}
                    type={this.props?.type ?? 'text'}
                    name={this.props.name}
                    id={this.props?.id ?? this.props?.name}
                    value={this.props?.defaultValue ?? this.props.value ?? ''}
                    onChange={this.handleChange}
                />
                <span className='char-counter'>{this.state.charCount}</span>
            </>
        );
    }
}
