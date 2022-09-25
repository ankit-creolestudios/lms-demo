import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import './OrdersTable.scss';

export default class OrderTable extends Component {
    render() {
        return (
            <div>
                <ApiTable
                    apiCall={{
                        method: 'GET',
                        path: '/orders/',
                    }}
                    columns={[
                        {
                            text: 'Status',
                            field: (row: any) => <Link to={`/admin/orders/${row._id}`}>{row.status}</Link>,
                            minWidth: '10%',
                            sortKey: 'status',
                        },
                        {
                            text: 'Order ID',
                            field: (row: any) => <Link to={`/admin/orders/${row._id}`}>{row._id}</Link>,
                            minWidth: '20%',
                            sortKey: 'orderId',
                        },
                        {
                            text: 'Amount',
                            field: (row: any) => <Link to={`/admin/orders/${row._id}`}>{row.amount}</Link>,
                            minWidth: '20%',
                            sortKey: 'amount',
                        },
                        {
                            text: 'Student',
                            field: (row: any) => (
                                <Link to={`/admin/orders/${row._id}`}>
                                    {row.contact.firstName} {row.contact.lastName}
                                </Link>
                            ),
                            minWidth: '30%',
                        },
                        {
                            text: 'Date',
                            field: 'date',
                            minWidth: '20%',
                            sortKey: 'date',
                        },
                    ]}
                />
            </div>
        );
    }
}
