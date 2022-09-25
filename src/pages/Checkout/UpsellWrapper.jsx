import React, { Component } from 'react';
import CheckoutContext from './CheckoutContext';
import './UpsellWrapper.scss';

export default class UpsellWrapper extends Component {
    static contextType = CheckoutContext;

    render() {
        return (
            <div className='upsell-wrapper'>
                <div className='upsell-header'>
                    {/* <img className='logo' src={'/logo.png'} alt='RealEstateU logo' /> */}
                    <h1 className='heading'>
                        The fastest and most affordable way to become a licensed real estate agent in Texas!
                    </h1>
                    <p className='subheading'>
                        This bundle includes everything you need to fulfill the State’s 180 hour education requirement.
                    </p>
                </div>
                {this.props.children}
            </div>
        );
    }
}
