import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

export const CheckoutForm = ({ packageId, zipCode, country }: any) => {
    const stripe = useStripe();
    const elements = useElements();

    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.REACT_APP_URL}/checkout/payment/confirmation`,
                payment_method_data: {
                    billing_details: {
                        address: {
                            country: country,
                            postal_code: zipCode,
                        },
                    },
                },
            },
        });

        if (error) {
            setErrorMessage(error.message as any);
        }
    };

    const paymentElementOptions: any = {
        fields: {
            billingDetails: {
                address: {
                    country: 'never',
                    postalCode: 'never',
                },
            },
        },
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement options={paymentElementOptions} />
            <button disabled={!stripe}>Pay Now</button>
            {errorMessage && <div>{errorMessage}</div>}
        </form>
    );
};
