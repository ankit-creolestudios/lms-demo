import React, { Component } from 'react';
import CheckoutContext from '../../CheckoutContext';
import Next from '../../Next';
import Upsell, { IUpsell } from './Upsell';

export default class Upsells extends Component {
    static contextType = CheckoutContext;

    proceedToContact = () => {
        this.context.switchTab(1, true);
    };

    render() {
        const { upsells } = this.context;

        return (
            <>
                {upsells.length === 0 ? (
                    ''
                ) : (
                    <>
                        <h1 className='checkout-upsells__header'>Frequently bought together</h1>
                        <h6>
                            For a <span>limited time</span> only we offer supportive material to the{' '}
                            {this.context.title} at a discounted price
                        </h6>
                        <div className='checkout-upsells'>
                            {upsells.map((upsell: IUpsell) => (
                                <Upsell key={upsell._id} {...upsell} />
                            ))}
                        </div>
                    </>
                )}

                <Next onClick={this.proceedToContact} />
            </>
        );
    }
}
