import React, { Component } from 'react';
import './OrderOverview.scss';

interface IProps {
    details: IOrderOverview;
}

export interface IOrderOverview {
    date: Date;
    status: string;
    firstName: string;
    lastName: string;
}

export default class OrderOverview extends Component<IProps> {
    render() {
        const { date = new Date(), firstName, lastName, status } = this.props.details;

        const formattedDate = new Date(date).toLocaleDateString();

        return (
            <div className='orderOverview'>
                <div>
                    <p>Date</p>
                    <p>{formattedDate}</p>
                </div>
                <div>
                    <p>Status</p>
                    <p>{status}</p>
                </div>
                <div>
                    <p>Student</p>
                    <p>
                        {firstName} {lastName}
                    </p>
                </div>
            </div>
        );
    }
}
