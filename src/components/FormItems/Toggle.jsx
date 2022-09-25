import React, { Component } from 'react';
import './Toggle.scss';

export default class Toggle extends Component {
    render() {
        // type can be radio, checkbox or toggle (toggle design will be implemented later on)
        const { name, id, type, onChange, checked, value, onClick } = this.props;

        return (
            <div
                className={`toggle-input toggle-input--${type}${checked ? ` toggle-input--${type}--checked` : ''}`}
                onClick={onClick}>
                <input
                    type={type === 'radio' ? 'radio' : 'checkbox'}
                    name={name}
                    value={value}
                    id={id}
                    checked={checked}
                    onChange={onChange}
                />
                {type === 'checkbox' ? (
                    <svg id='check' fill='currentColor' viewBox='-281 373 48 48' width='18px' height='18px'>
                        <path id='check-stroke' d='M-273.2,398.2l10,9.9 l22.4-22.3' />
                    </svg>
                ) : (
                    <div></div>
                )}
            </div>
        );
    }
}
