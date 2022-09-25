import { camelCase } from 'lodash';
import React, { Component } from 'react';
import { Form } from 'react-bootstrap';

export class CheckboxInput extends Component<any> {
    render() {
        const { title, checboxData, handleChange, optionKey, optionLabel, checkValue } = this.props;
        return (
            <div className='form__field'>
                <label htmlFor={camelCase(title)}>{title}</label>
                <Form className={`${camelCase(title)}-form`} name={camelCase(title)}>
                    {checboxData.map((data: any, index: number) => (
                        <Form.Check
                            key={index}
                            name={!!optionKey ? camelCase(data?.[optionKey]) : camelCase(data)}
                            type='checkbox'
                            label={!!optionKey ? data?.[optionLabel] : data}
                            checked={
                                !!optionKey ? checkValue?.[camelCase(data?.[optionKey])] : checkValue?.[camelCase(data)]
                            }
                            onChange={(e) => handleChange(e.target.name, e.target.checked)}
                        />
                    ))}
                </Form>
            </div>
        );
    }
}
