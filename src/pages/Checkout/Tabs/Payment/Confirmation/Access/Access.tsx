import React, { Component } from 'react';
import './Access.scss';

interface IProps {
    email: string;
    password: string;
}

export default class Access extends Component<IProps> {
    render() {
        const { email, password } = this.props;
        // const email = 'email@mail.com';
        // const password = 'password';
        return (
            <div className='access'>
                <h2>Access your course now!</h2>
                <p>We have sent an email to {email} containing your login info:</p>
                <p>
                    <span>Your username: </span> {email}
                </p>
                <p>
                    <span>Your temporary password: </span> {password}
                </p>
                <button>Access my course now</button>
            </div>
        );
    }
}
