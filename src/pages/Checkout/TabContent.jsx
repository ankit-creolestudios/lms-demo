import React, { Component } from 'react';
import CheckoutContext from './CheckoutContext';
import { Contact, Address, Billing, Payment, Upsells } from './Tabs/index.ts';

export default class TabContent extends Component {
    static contextType = CheckoutContext;

    render() {
        switch (this.context.currentTab) {
            case 0:
                return <Upsells />;
            case 1:
                return <Contact />;
            case 2:
                return <Address />;
            case 3:
                return <Billing />;
            case 4:
                return <Payment />;
            default:
                return <></>;
        }
    }
}
