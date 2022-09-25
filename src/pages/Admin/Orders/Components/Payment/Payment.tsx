import React, { Component } from 'react';
import { Table } from 'src/components/Table';
import './Payment.scss';

interface IProps {
    payment: Record<string, any>;
}

interface IState {
    formattedPayments: IFormattedPayment[];
}

interface IFormattedPayment {
    transactionId: string;
    transactionMethod: string;
    transactionType: string;
    amount: string;
    date: string;
}

export default class Payment extends Component<IProps, IState> {
    state = {
        formattedPayments: [],
    };

    componentDidMount() {
        this.formatPayments(this.props.payment);
    }

    formatPayments = (payments: any) => {
        const formattedPayments: IFormattedPayment[] = [];

        payments.forEach((payment: any) => {
            const formattedPayment: IFormattedPayment = {
                transactionId: '',
                transactionMethod: '',
                transactionType: '',
                amount: '',
                date: '',
            };

            if (payment.paypal) {
                formattedPayment.transactionId = payment.paypal.orderId;
                formattedPayment.transactionMethod = 'PayPal';
                formattedPayment.transactionType = 'Payment';
                formattedPayment.amount = `$${payment.paypal.purchaseUnit[0].amount.value}`;
                formattedPayment.date = new Date(
                    payment.paypal.purchaseUnit[0].payments.captures[0].create_time
                ).toLocaleDateString();

                formattedPayments.push(formattedPayment);
            }

            if (payment.stripe) {
                formattedPayment.transactionId = payment.stripe.id;
                formattedPayment.transactionMethod = 'Stripe';
                formattedPayment.transactionType = 'Payment';
                formattedPayment.amount = `$${payment.stripe.amount_received / 100}`;
                const d = new Date(0);
                d.setUTCSeconds(payment.stripe.created);
                formattedPayment.date = d.toLocaleDateString();

                formattedPayments.push(formattedPayment);
            }
        });

        this.setState({
            formattedPayments,
        });
    };

    render() {
        const { formattedPayments } = this.state;

        console.log(this.props.payment);

        return (
            <Table
                rows={formattedPayments}
                columns={[
                    {
                        text: 'Transaction ID',
                        field: 'transactionId',
                    },
                    {
                        text: 'Transaction Method',
                        field: 'transactionMethod',
                    },
                    {
                        text: 'Transaction Type',
                        field: 'transactionType',
                    },
                    {
                        text: 'Amount',
                        field: 'amount',
                    },
                    {
                        text: 'Date',
                        field: 'date',
                    },
                ]}
            />
        );
    }
}
