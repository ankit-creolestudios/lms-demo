import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './ThemeOptions.scss';

export default class ThemeOptions extends Component {
    colors = {
        default: '#fff',
        navy: '#25255e',
        green: '#2fcca1',
        blue: '#a0d6ef',
        cyan: '#aceded',
        honeydew: '#ebfaf6',
        yellow: '#fef5c5',
        cinderalla: '#fde3d1',
        orange: '#ffd9a7',
        pink: '#ffbbb9',
        kobi: '#eca8d4',
        vanilla: '#eecee6',
    };

    state = {
        theme: '',
    };

    handleColorClick = (color) => (e) => {
        this.props.handleInputChange({
            target: {
                name: 'theme',
                value: color,
            },
        });
    };

    render() {
        const { orderIndex, theme } = this.props;

        return (
            <div>
                <label htmlFor={`theme-${orderIndex}`}>Color theme</label>

                <div className='color-select'>
                    {Object.keys(this.colors).map((color) => {
                        const isHeaderColor = ['navy', 'green'].includes(color);

                        return (
                            <OverlayTrigger
                                key={this.colors[color]}
                                placement='top'
                                overlay={
                                    <Tooltip id={`color-${this.colors[color]}`}>
                                        {`${color[0].toUpperCase()}${color.slice(1)}`}&nbsp;
                                        {isHeaderColor ? 'header' : 'background'}
                                    </Tooltip>
                                }
                            >
                                <div
                                    className={`color-select__option${
                                        theme === color ? ' color-select__option--active' : ''
                                    }${isHeaderColor ? ' color-select__option--header' : ''}`}
                                    onClick={this.handleColorClick(color)}
                                    style={{ backgroundColor: this.colors[color] }}
                                />
                            </OverlayTrigger>
                        );
                    })}
                </div>
            </div>
        );
    }
}

