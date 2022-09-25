import React, { Component } from 'react';
import { Spinner } from 'src/components/Spinner';
import { Api, EventBus } from 'src/helpers/new';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { RootState } from 'src/store/reducers/rootReducer';
import { CheckoutForm } from './Checkout';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { getState } from 'src/helpers/localStorage';

interface IProps {
    match: {
        params: {
            packageId: string;
        };
    };
}

interface IConnectProps {
    loggedIn: any;
}

type Tprops = IProps & RouteComponentProps & IConnectProps;

interface IState {
    isLoading: boolean;
    cart: any;
    clientSecret: string;
    title: string;
    zipCode: string;
    country: string;
}

class Stripe extends Component<Tprops, IState> {
    state = {
        isLoading: true,
        cart: {},
        clientSecret: '',
        title: '',
        zipCode: '',
        country: '',
    };
    stripePromise = loadStripe(`${process.env.REACT_APP_STRIPE_PK}`);

    async componentDidMount() {
        this.loadData();
    }

    async loadData() {
        const cartId = getState('reuCheckoutCartId');

        if (!cartId) {
            EventBus.dispatch('toast', {
                type: 'error',
                message: 'Cart not found.',
            });
            this.props.history.push('/');
        }

        const { success, response } = await Api.call('get', `checkout/cart/initiatepayment/${cartId}/stripe`);

        if (success) {
            this.setState({
                isLoading: false,
                cart: response.cart,
                clientSecret: response.clientSecret,
                title: response.cart?.packages[0]?.title,
                zipCode: response.cart?.billingAddress?.zipCode,
                country: response.cart?.billingAddress?.country,
            });
        }
    }

    render() {
        const { isLoading, zipCode, title, country } = this.state;

        if (isLoading) {
            return <Spinner />;
        } else {
            const { packageId } = this.props.match.params;

            const elementsOptions: any = {
                clientSecret: this.state.clientSecret,
                appearance: {
                    theme: 'none',
                    variables: {
                        colorPrimary: '#0570de',
                        colorBackground: '#ffffff',
                        colorText: '#30313d',
                        colorDanger: '#df1b41',
                        fontSizeBase: '16px',
                        fontFamily: 'Ideal Sans, system-ui, sans-serif',
                        spacingUnit: '7.5px',
                        borderRadius: '4px',
                    },
                },
            };

            return (
                <div className='checkout-container'>
                    <div className='product-title'>
                        <h4>{title}</h4>
                    </div>

                    <div className='checkout-main'>
                        <Elements stripe={this.stripePromise} options={elementsOptions}>
                            <CheckoutForm packageId={packageId} zipCode={zipCode} country={country} />
                        </Elements>
                    </div>
                </div>
            );
        }
    }
}

export default connect((state: RootState) => {
    return {
        loggedIn: state.loggedIn,
    };
})(withRouter(Stripe));
