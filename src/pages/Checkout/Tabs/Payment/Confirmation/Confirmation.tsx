import React, { Component } from 'react';
import Header from './Header';
import Discount from './Discount/Discount';

export default class Confirmation extends Component {
    componentDidMount() {
        localStorage.removeItem('reuCheckoutCartId');
        localStorage.removeItem('__paypal_storage__');
        localStorage.removeItem('reuCheckoutCurrentTab');
    }

    render() {
        return (
            <div className='checkout-container'>
                <Header />
                <Discount />
            </div>
        );
    }
}
