import React, { Component } from 'react';
import './Header.scss';

interface IProps {}

export default class Header extends Component<IProps> {
    render() {
        return (
            <div
                className='confirmation__header'
                style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/bg-yourcourseready.jpg)` }}
            >
                <img src={process.env.PUBLIC_URL + '/icon-yourcourseready.svg'} />
                <h1>Your Course is Ready - Thank you for your order!</h1>

                <h3>
                    Check the link sent to your email to set your password <i className='fas fa-envelope' />
                </h3>
            </div>
        );
    }
}
