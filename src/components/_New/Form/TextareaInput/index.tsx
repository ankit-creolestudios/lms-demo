import { camelCase } from 'lodash';
import React, { Component } from 'react';

export default class TextareaInput extends Component<any> {
    render() {
        const { title, value, handleChange } = this.props;
        return (
            <div className='form__field'>
                <label htmlFor={camelCase(title)}>{title}</label>
                <textarea
                    id={camelCase(title)}
                    name={camelCase(title)}
                    value={value}
                    onChange={(e) => handleChange(camelCase(title), e.target.value)}
                />
            </div>
        );
    }
}
