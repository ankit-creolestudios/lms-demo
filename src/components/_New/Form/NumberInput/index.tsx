import { camelCase } from 'lodash';
import React, { Component } from 'react';

export class NumberInput extends Component<any> {
    render() {
        const { title, value, handleChange, min } = this.props;
        return (
            <div className='form__field'>
                <label htmlFor={camelCase(title)}>{title}</label>
                <input
                    required
                    min={min}
                    type='number'
                    id={camelCase(title)}
                    name={camelCase(title)}
                    value={value}
                    onChange={(e) =>
                        handleChange(camelCase(title), Math.max(0, Math.min(9999999999, Number(e.target.value))))
                    }
                />
            </div>
        );
    }
}
