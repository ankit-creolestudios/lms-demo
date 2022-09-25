import React, { Component } from 'react';
import { matchState } from 'src/helpers/matchState';
import { IBillingAddress } from '../../IOrder';
import './BillingAddress.scss';

interface IProps {
    address: IBillingAddress;
}

export default class BillingAddress extends Component<IProps> {
    render() {
        const { firstName = '', lastName = '', streetLines, town, state, zipCode, country } = this.props.address;

        const formattedState = matchState(state);

        return (
            <div className='billingAddress'>
                <h2>Billing Address</h2>

                <div>
                    <p>First Name</p>
                    <p>{firstName}</p>
                </div>

                <div>
                    <p>Last Name</p>
                    <p>{lastName}</p>
                </div>

                <div>
                    <p>Address Line</p>
                    <p>{streetLines[0]}</p>
                </div>

                <div>
                    <p>City</p>
                    <p>{town}</p>
                </div>

                <div>
                    <p>State</p>
                    <p>{formattedState}</p>
                </div>

                <div>
                    <p>Zip Code</p>
                    <p>{zipCode}</p>
                </div>

                <div>
                    <p>Country</p>
                    <p>{country}</p>
                </div>
            </div>
        );
    }
}
