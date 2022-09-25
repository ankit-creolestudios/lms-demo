import React, { Component } from 'react';
import './Header.scss';

export interface IProps {
    heading?: string;
    subHeading?: string;
}

export default class Header extends Component<IProps> {
    render() {
        const { heading, subHeading } = this.props;

        return (
            <header>
                {heading && <h1 className={subHeading ? '' : 'single'}>{heading}</h1>}
                {subHeading && <h2 className={heading ? '' : 'single'}>{subHeading}</h2>}
            </header>
        );
    }
}
