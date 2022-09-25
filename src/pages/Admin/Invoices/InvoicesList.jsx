import React, { Component } from 'react';
import { ApiTable } from '../../../components/ApiTable';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { Link } from 'react-router-dom';
import { faCheckCircle, faEye, faPrint, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';

export default class InvoicesList extends Component {
    render() {
        return (
            <div>
                <ApiTable
                    basePath='/admin/invoices'
                    apiCall={{
                        method: 'GET',
                        path: '/users/invoices',
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row) => [
                                <OverlayTrigger
                                    key={`invoice-${row._id}-view)}`}
                                    placement='top'
                                    overlay={<Tooltip id={`tooltip-${row._id}-view)}`}>View invoice</Tooltip>}>
                                    <Link className='btn btn--small' to={'/admin/invoices/' + row._id}>
                                        <Fa icon={faEye} />
                                    </Link>
                                </OverlayTrigger>,
                                <OverlayTrigger
                                    key={`invoice-${row._id}-print)}`}
                                    placement='top'
                                    overlay={<Tooltip id={`tooltip-${row._id}-print)}`}>Print invoice</Tooltip>}>
                                    <Link className='btn btn--small' to={'/admin/invoices/' + row._id + '/print'}>
                                        <Fa icon={faPrint} />
                                    </Link>
                                </OverlayTrigger>,
                            ],
                            maxWidth: '6.17rem',
                            className: 'col--controls',
                        },
                        {
                            text: 'Status',
                            field: (row) => (
                                <Badge pill variant={this.props.statusMap[row.status].badge}>
                                    {this.props.statusMap[row.status].text}
                                </Badge>
                            ),
                            maxWidth: '7rem',
                            className: 'col--center',
                            headClassName: 'col--center',
                            sortKey: 'status',
                        },
                        {
                            text: 'Id',
                            field: '_id',
                            minWidth: '20%',
                            sortKey: '_id',
                        },
                        {
                            text: 'Amount',
                            field: (row) =>
                                row.totalPrice.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                }),
                            sortKey: 'totalPrice',
                        },
                        {
                            text: 'Student',
                            field: (row) => (
                                <Link to={`/admin/users/${row.user._id}`}>
                                    {row.user.firstName} {row.user.lastName}
                                </Link>
                            ),
                            sortKey: 'firstName-lastName',
                        },
                        {
                            text: 'Date',
                            field: (row) => new Date(row.date).toLocaleString('en-US'),
                        },
                    ]}
                    rowButtons={[
                        {
                            text: 'Mark invoice as Paid',
                            icon: faCheckCircle,
                            clickCallback: async (e, row, reloadTable) => {
                                await this.props.changeInvoiceStatus(row._id, 'paid', reloadTable);
                            },
                            condition: (row) => {
                                return ['CANC', 'PAID'].indexOf(row.status) === -1;
                            },
                        },
                        {
                            text: 'Cancel invoice',
                            icon: faTimesCircle,
                            clickCallback: async (e, row, reloadTable) => {
                                await this.props.changeInvoiceStatus(row._id, 'cancel', reloadTable);
                            },
                            condition: (row) => {
                                return ['CANC', 'PAID'].indexOf(row.status) === -1;
                            },
                        },
                    ]}
                />
                <ConfirmationModal
                    show={false}
                    hideModal={null}
                    titleText='mark as paid'
                    bodyText="Are you sure you want to delete user's account?"
                    confirmAction={null}
                />
            </div>
        );
    }
}
