import React, { Component } from 'react';
import { Table } from 'src/components/Table';
import { Api } from 'src/helpers/new';
import { IPackage } from '../../IOrder';
import './Packages.scss';

interface IProps {
    packages: IPackage[];
}

interface IState {
    formattedPackages: IFormattedPackage[];
    totalTax: string;
    subTotal: string;
    total: string;
}

interface IFormattedPackage {
    name: string;
    amount: string;
    tax: string;
    taxClass: string;
}

export default class Packages extends Component<IProps, IState> {
    state = {
        formattedPackages: [],
        totalTax: '0',
        subTotal: '0',
        total: '0',
    };

    componentDidMount() {
        this.formatPackages(this.props.packages);
    }

    formatPackages = async (packages: IPackage[]) => {
        const formattedPackages = [];
        let subTotal = 0,
            totalTax = 0,
            total = 0;

        console.log(packages);

        for (const pack of packages) {
            const { success, response } = await Api.call('get', `packages/orders/${pack.packageId}`);

            subTotal += pack.price;
            totalTax += pack.taxValue ?? 0;

            let obj: IFormattedPackage;
            if (success) {
                obj = {
                    name: response.title,
                    amount: `$${pack.price.toFixed(2)}`,
                    tax: `$${pack.taxValue?.toFixed(2)}`,
                    taxClass: `${pack.taxLabel === 'eservice' ? 'E-Service' : 'Standard Rate'}`,
                };
                formattedPackages.push(obj);
            }
        }

        total = subTotal + totalTax;

        this.setState({
            formattedPackages,
            total: total.toFixed(2),
            subTotal: subTotal.toFixed(2),
            totalTax: totalTax.toFixed(2),
        });
    };

    render() {
        const { packages } = this.props;
        const { formattedPackages, total, totalTax, subTotal } = this.state;

        return (
            <div className='packages'>
                <Table
                    rows={formattedPackages}
                    columns={[
                        {
                            text: 'Package',
                            field: 'name',
                        },
                        {
                            text: 'Amount',
                            field: 'amount',
                        },
                        {
                            text: 'Tax',
                            field: (row: any) => {
                                return (
                                    <p>
                                        {row.tax} ({row.taxClass})
                                    </p>
                                );
                            },
                        },
                    ]}
                />

                <div className='summary'>
                    <div>
                        <p>Sub Total</p>
                        <p>${subTotal}</p>
                    </div>

                    <div>
                        <p>Total Tax</p>
                        <p>${totalTax}</p>
                    </div>

                    <div>
                        <p>Total</p>
                        <p>${total}</p>
                    </div>
                </div>
            </div>
        );
    }
}
