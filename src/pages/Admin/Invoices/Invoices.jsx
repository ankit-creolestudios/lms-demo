import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import InvoicesList from './InvoicesList';
import Invoice from './Invoice';
import apiCall from '../../../helpers/apiCall';

class Invoices extends Component {
    statusMap = {
        NEW: {
            text: 'PENDING',
            badge: 'dark',
        },
        PAID: {
            text: 'PAID',
            badge: 'success',
        },
        CANC: {
            text: 'CANCELED',
            badge: 'danger',
        },
        FAIL: {
            text: 'FAILED',
            badge: 'dark',
        },
    };

    constructor(props) {
        super(props);

        props.pushBreadcrumbLink({
            text: 'Invoices',
            path: '/admin/invoices',
        });
    }

    changeInvoiceStatus = async (invoiceId, status = 'paid', callback) => {
        const { success, message } = await apiCall('POST', `/users/invoices/${invoiceId}/${status}`);

        if (success) {
            if (callback) {
                await callback();
            }

            this.props.setGlobalAlert({ type: 'success', message });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Invoices',
            path: '/admin/invoices',
        });
    }

    render() {
        return (
            <div id='invoices'>
                <Switch>
                    <Route exact path='/admin/invoices'>
                        <InvoicesList statusMap={this.statusMap} changeInvoiceStatus={this.changeInvoiceStatus} />
                    </Route>
                    <Route exact path='/admin/invoices/:id'>
                        <Invoice statusMap={this.statusMap} changeInvoiceStatus={this.changeInvoiceStatus} />
                    </Route>
                </Switch>
            </div>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(Invoices);
