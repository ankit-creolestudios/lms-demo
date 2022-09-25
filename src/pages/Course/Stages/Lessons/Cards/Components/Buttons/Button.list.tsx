import React, { Component } from 'react';
import Button, { IButton } from './Button';
import './Button.list.scss';

interface IProps {
    buttons: IButton[];
}

export default class ButtonList extends Component<IProps> {
    render() {
        const { buttons } = this.props;

        return (
            <div className='button-list'>
                {buttons.map((button: IButton, index: number) => {
                    return <Button key={index} {...button} />;
                })}
            </div>
        );
    }
}
