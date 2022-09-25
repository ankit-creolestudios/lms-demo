import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MenuPopupContext from './MenuPopupContext';
import './MenuPopupItem.scss';

interface IProps {
    onClick?: (e?: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => void;
    preventParentClose?: boolean;
    className?: string;
    to?: string;
}

export default class MenuPopupItem extends Component<IProps, any> {
    static contextType = MenuPopupContext;

    onClick = (e: React.MouseEvent<HTMLDivElement | HTMLAnchorElement>) => {
        this.props?.onClick?.(e);

        if (!this.props.preventParentClose) {
            this.context.closeMenu();
        }
    };

    get className() {
        let className = 'menu-popup__item';

        if (this.props.className) {
            className += ` ${this.props.className}`;
        }
        return className;
    }

    render() {
        if (this.props.to) {
            //if you use onMouseDown it will prevent the to link from working
            return (
                <Link
                    {...this.props}
                    to={this.props.to}
                    className={this.className}
                    // onMouseDown={this.onClick}
                    tabIndex={0}
                >
                    {this.props.children}
                </Link>
            );
        }
        return (
            <div className={this.className} onMouseDown={this.onClick} tabIndex={0}>
                {this.props.children}
            </div>
        );
    }
}
