import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import * as OrderInterface from './IOrder';
import OrderOverview, { IOrderOverview } from './Components/OrderOverview';
import BillingAddress from './Components/BillingAddress';
import './Order.scss';
import ResidentialAddress from './Components/ResidentialAddress/ResidentialAddress';
import Packages from './Components/Packages/Packages';
import Payment from './Components/Payment/Payment';

interface IRouteProps {
    orderId: string;
}

interface IState {
    order: OrderInterface.IOrder | undefined;
}

interface IProps {}

export default class Order extends Component<IProps & RouteComponentProps<IRouteProps>, IState> {
    async componentDidMount() {
        await this.loadOrder();
    }

    loadOrder = async () => {
        const { success, response } = await Api.call('get', `orders/${this.props.match.params.orderId}`);

        if (success) {
            this.setState({
                order: response,
            });
        }
    };

    get orderOverview(): IOrderOverview {
        return {
            date: this.state.order?.date ?? new Date(),
            firstName: this.state.order?.contact?.firstName ?? '',
            lastName: this.state.order?.contact?.lastName ?? '',
            status: this.state.order?.status ?? '',
        };
    }

    get billingAddress(): OrderInterface.IBillingAddress {
        return (
            this.state.order?.billingAddress ?? {
                firstName: '',
                lastName: '',
                streetLines: [''],
                state: '',
                country: 'US',
                town: '',
                zipCode: '',
            }
        );
    }

    get residentialAddress(): OrderInterface.IResidentialAddress {
        return (
            this.state.order?.residentialAddress ?? {
                streetLines: [''],
                state: '',
                country: 'US',
                town: '',
                zipCode: '',
            }
        );
    }

    get packages(): OrderInterface.IPackage[] {
        return (
            this.state.order?.packages ?? [
                {
                    taxes: [],
                    price: 0,
                    packageId: '',
                    upsoldToPackageId: '',
                    discountValue: 0,
                    discountType: '',
                    oldPrice: 0,
                },
            ]
        );
    }

    get payment() {
        return this.state.order?.paymentDetails ?? {};
    }

    render() {
        if (this.state) {
            let viewOrderLink = '';

            if (this.state.order?.paymentDetails[0].paypal) {
                console.log(this.state.order?.paymentDetails[0].paypal);
                viewOrderLink = `https://www.paypal.com/mep/dashboard/`;
            } else {
                viewOrderLink = `https://dashboard.stripe.com/test/payments/${this.state.order?.paymentDetails[0].stripe.id}`;
            }

            return (
                <>
                    <div className='order'>
                        <OrderOverview details={this.orderOverview} />
                        <BillingAddress address={this.billingAddress} />
                        <ResidentialAddress address={this.residentialAddress} />
                        <button>Refund</button>
                        <Link to={{ pathname: `${viewOrderLink}` }} target='_blank'>
                            <button>View Invoice</button>
                        </Link>
                    </div>
                    <div className='packageWrapper'>
                        <h2>Purchase</h2>
                        <Packages packages={this.packages} />
                    </div>

                    <div className='paymentWrapper'>
                        <h2>Payments</h2>
                        <Payment payment={this.payment} />
                    </div>
                </>
            );
        } else {
            return <></>;
        }
    }
}
