import React, { Component } from 'react';
import { BsCreditCard, BsShieldLock } from 'react-icons/bs';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import CheckoutContext from '../../CheckoutContext';
import { PayPalButton } from 'react-paypal-button-v2';
import { Api, EventBus } from 'src/helpers/new';
import { getState } from 'src/helpers/localStorage';

interface IState {
    price: number;
    tax: number;
    studentAgreement: boolean;
    termsAgreement: boolean;
    cartId: string;
}

class Payment extends Component<RouteComponentProps, IState> {
    static contextType = CheckoutContext;
    prevContext: any;

    state: IState = {
        price: 0,
        tax: 0,
        studentAgreement: false,
        termsAgreement: false,
        cartId: '',
    };

    componentDidMount() {
        this.getPrice();
        this.prevContext = this.context;
    }

    componentDidUpdate() {
        if (this.context.couponCode !== this.prevContext.couponCode) {
            this.getPrice();
        }
        this.prevContext = this.context;
    }

    getPrice = async () => {
        const cartId = localStorage.getItem('reuCheckoutCartId');
        const { success, response, error, raw } = await Api.call('get', `checkout/cart/${cartId}/getPrice`);

        if (success) {
            EventBus.dispatch('set-tax-value', response.tax);
            this.setState({
                price: response.price,
                tax: response.tax,
                cartId: cartId ?? '',
            });
        }
    };

    postPaypal = async (details: any, data: any) => {
        const { success } = await Api.call('POST', 'checkout/cart/paypal', { paymentObj: { details, data } });

        if (success) {
            this.props.history.push(`/checkout/payment/confirmation`);
        }
    };

    checkboxToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        // @ts-ignore
        this.setState({ [e.currentTarget.name]: !this.state[e.currentTarget.name] });
    };

    initatePaypalPayment = async () => {
        const cartId = getState('reuCheckoutCartId');
        const { success, response } = await Api.call('get', `checkout/cart/initiatepayment/${cartId}/paypal`);

        if (success) {
            return response.orderId;
        }
    };

    render() {
        const { price, tax, studentAgreement, termsAgreement } = this.state;

        const studentHasAgreed = studentAgreement && termsAgreement;
        const paypalPrice = (price + tax).toFixed(2);

        console.log(this.context.packages[0]._id);

        return (
            <div className='checkout-payment'>
                <h1>Choose your payment method</h1>
                <label htmlFor='studentAgreement'>
                    <input
                        type='checkbox'
                        name='studentAgreement'
                        id='studentAgreement'
                        onChange={this.checkboxToggle}
                    />
                    I have read and agree to the student enrollment agreement
                </label>
                <label htmlFor='termsAgreement'>
                    <input type='checkbox' name='termsAgreement' id='termsAgreement' onChange={this.checkboxToggle} />I
                    have read and agree to the terms and conditions
                </label>
                <div className='checkout-payment__options'>
                    <div className='checkout-payment__card'>
                        <Link to={studentHasAgreed ? `/checkout/payment/card` : '#'}>
                            <button className='dark sm'>
                                <BsCreditCard />
                                &nbsp; Pay directly by card
                            </button>
                        </Link>
                        <div className='cards-logos'>
                            <img src={process.env.PUBLIC_URL + '/visa.png'} alt='Visa logo' />
                            <img src={process.env.PUBLIC_URL + '/mastercard.png'} alt='Mastercard logo' />
                            <img src={process.env.PUBLIC_URL + '/americanexpress.png'} alt='American express logo' />
                            <img src={process.env.PUBLIC_URL + '/unionpay.svg'} alt='UnionPay logo' />
                        </div>
                        <span>Pay directly with RealEstateU through our secured payment platform</span>
                        <div className='checkout-payment__badges'>
                            <div className='checkout-payment__stripe'>
                                Powered by <img src={process.env.PUBLIC_URL + '/stripe.svg'} alt='' />
                            </div>
                            <div className='checkout-payment__ssl'>
                                <BsShieldLock />
                                <div>
                                    Fully secured <span>SSL checkout</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='checkout-payment__or'>or</div>
                    <div className='checkout-payment__paypal'>
                        {studentHasAgreed ? (
                            <div className='paypal'>
                                <PayPalButton
                                    onSuccess={this.postPaypal}
                                    createOrder={async (data: any, actions: any) => {
                                        const encryptedOrderId = await this.initatePaypalPayment();

                                        return actions.order.create({
                                            purchase_units: [
                                                {
                                                    custom_id: encryptedOrderId,
                                                    amount: {
                                                        currency_code: 'USD',
                                                        value: paypalPrice,
                                                    },
                                                },
                                            ],
                                            application_context: {
                                                shipping_preference: 'NO_SHIPPING',
                                            },
                                        });
                                    }}
                                    options={{
                                        clientId: `${process.env.REACT_APP_paypalClientId}`,
                                        disableFunding: 'card',
                                    }}
                                    style={{
                                        shape: 'pill',
                                        color: 'silver',
                                        layout: 'horizontal',
                                        label: 'pay',
                                        tagline: 'false',
                                        height: 55,
                                    }}
                                />
                            </div>
                        ) : (
                            <button className='light sm'>
                                Pay with
                                <img src={process.env.PUBLIC_URL + '/paypal.svg'} alt='PayPal logo' />
                            </button>
                        )}

                        <span>
                            If you prefer, you can also use PayPal as a payment platform at no extra cost. You will be
                            taken to Paypal’s website and taken back here upon completion.
                        </span>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Payment);
