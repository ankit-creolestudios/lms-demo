import React, { Component } from 'react';
import { matchState } from 'src/helpers/matchState';
import { IResidentialAddress } from '../../IOrder';
import './ResidentialAddress.scss';

interface IProps {
    address: IResidentialAddress;
}

export default class ResidentialAddress extends Component<IProps> {
    render() {
        const { streetLines, town, state, zipCode, country } = this.props.address;

        const formattedState = matchState(state);

        return (
            <div className='residentialAddress'>
                <h2>Residential Address</h2>

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
