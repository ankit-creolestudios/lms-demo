import React, { Component } from 'react';
import { camelCase } from 'lodash';

export class SelectInput extends Component<any> {
    render() {
        const {
            title,
            optionData,
            value,
            handleChange,
            multiple,
            extraLabelComp: Comp,
            optionLabel,
            optionKey,
        } = this.props;
        return (
            <div className='form__field'>
                <div className='label-container'>
                    <label htmlFor={camelCase(title)}>{title}</label>
                    {Comp && <Comp />}
                </div>
                <select
                    required
                    name={camelCase(title)}
                    multiple={multiple}
                    value={value}
                    onChange={(e) => {
                        if (multiple) {
                            const multipleSelected = [
                                ...(e.target as EventTarget & HTMLSelectElement).selectedOptions,
                            ].map((option) => option.value);
                            handleChange(camelCase(title), multipleSelected);
                        } else {
                            handleChange(camelCase(title), e.target.value);
                        }
                    }}
                >
                    {!multiple && (
                        <option selected disabled value={''}>
                            Select Option
                        </option>
                    )}
                    {optionData.map((data: any, i: number) => (
                        <option key={i} value={!!optionKey ? data?.[optionKey] : data}>
                            {!!optionKey ? data?.[optionLabel] : data}
                        </option>
                    ))}
                </select>
            </div>
        );
    }
}
