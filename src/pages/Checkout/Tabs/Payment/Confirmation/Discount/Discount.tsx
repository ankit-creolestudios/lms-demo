import React, { Component } from 'react';
import './Discount.scss';

export default class Discount extends Component {
    render() {
        return (
            <div className='discount'>
                <div>
                    <h2>Thank you for enrolling with Real Estate U</h2>
                    <p>
                        As a thank you for your purchase, Real Estate U would like to offer you a 10% discount on any
                        future purchase! You can use this discount by:
                    </p>
                    <ul>
                        <li>Buying any of the add-ons shown below</li>
                        <li>Enrolling in any future course</li>
                        <li>Sharing this discount with a friend for any of their purchase</li>
                    </ul>
                </div>
                <div>
                    <img src={process.env.PUBLIC_URL + '/checkout-discountvoucher.svg'} />
                    <div>
                        <p>REUSPECIAL10</p>
                        <img src={process.env.PUBLIC_URL + '/icon-copy.svg'} />
                    </div>
                </div>
            </div>
        );
    }
}
