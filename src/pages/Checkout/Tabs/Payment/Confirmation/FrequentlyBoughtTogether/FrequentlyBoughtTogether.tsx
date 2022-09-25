import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
// import Upsell from '../../../Upsells/Upsell';
import './FBT.scss';
import Upsell from './Upsell';

interface IProps {
    userId: string;
}
interface IState {
    upsells: any[];
}

export default class FrequentlyBoughtTogether extends Component<IProps, IState> {
    state = {
        upsells: [],
    };

    async componentDidMount() {
        this.loadUpsells();
    }

    loadUpsells = async () => {
        // const cartId = localStorage.getItem('reuCheckoutCartId'),
        // { success, response } = await Api.call('GET', `/packages/${packageId}/cart`);
        // if (success) {
        //     this.setState({
        //         upsells: response.upsells ?? [],
        //     });
        // }
    };

    render() {
        if (this.state.upsells.length === 0) {
            return null;
        }

        return (
            <div className='frequentlyBoughtTogether'>
                <h2>Frequently Bought Together</h2>
                <p>
                    For a <span>limited time</span> only we offer supportive material to the Texas Real Estate Licence
                    Certification Course at a discounted price
                </p>

                <div className='checkout-main'>
                    {this.state.upsells.map((upsell: any) => (
                        <Upsell key={upsell._id} {...upsell} />
                    ))}
                </div>
            </div>
        );
    }
}
