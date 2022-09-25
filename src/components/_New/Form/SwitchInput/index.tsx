import React, { Component } from 'react';
import { camelCase, kebabCase } from 'lodash';
import { Form } from 'react-bootstrap';

export class SwitchInput extends Component<any> {
    render() {
        const { title, checkedValue, handleClick, name, label } = this.props;
        return (
            <Form>
                {label && (
                    <div className='label-container'>
                        <label htmlFor={camelCase(label)}>{label}</label>
                    </div>
                )}
                <Form.Check
                    type='switch'
                    className={kebabCase(title)}
                    id={kebabCase(title)}
                    name={camelCase(name)}
                    label={title}
                    checked={checkedValue}
                    onChange={(e) => handleClick(camelCase(name), e.target.checked)}
                />
            </Form>
        );
    }
}
