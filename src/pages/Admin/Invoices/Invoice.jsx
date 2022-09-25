import '../../../components/ApiTable/ApiTable.scss';
import './Invoice.scss';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import apiCall from '../../../helpers/apiCall';
import { Badge, Col, Row } from 'react-bootstrap';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faPrint, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

class Invoice extends Component {
    state = {};

    constructor(props) {
        super(props);
        props.pushBreadcrumbLink({
            text: props.match.params.id,
            path: '/admin/invoices/' + props.match.params.id,
        });
    }

    async componentDidMount() {
        await this.loadInvoice();
    }

    async loadInvoice() {
        const { response, success, message } = await apiCall('GET', '/users/invoices/' + this.props.match.params.id);

        if (success) {
            this.setState({ ...response });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: this.props.match.params.id,
            path: '/admin/invoices/' + this.props.match.params.id,
        });
    }

    render() {
        const { user } = this.state;
        let taxTotal = 0,
            subTotal = 0;

        if (!this.state._id) {
            return null;
        }
        return (
            <Row>
                <Col xs={'8'}>
                    <div className='table-wrapper'>
                        <div className='table'>
                            <div className='header'>
                                <div className='col'>Id</div>
                                <div className='col'>Title</div>
                                <div className='col'>Price</div>
                                <div className='col'>Tax</div>
                            </div>
                            <div className='main'>
                                {this.state.packages &&
                                    this.state.packages.map((pack) => {
                                        const tax =
                                            pack.taxType === 'FIXED'
                                                ? pack.taxValue
                                                : (pack.taxValue / 100) * pack.price;

                                        subTotal += pack.price;
                                        taxTotal += tax;
                                        return (
                                            <div key={pack.data._id} className='row'>
                                                <div className='col'>{pack.data._id}</div>
                                                <div className='col'>{pack.data.title}</div>
                                                <div className='col'>
                                                    {pack.price.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    })}
                                                </div>
                                                <div className='col'>
                                                    {tax.toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                <div className='row row--sep'>
                                    <div className='col' />
                                    <div className='col'>
                                        <b>Subtotal</b>
                                    </div>
                                    <div className='col'>
                                        {subTotal.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </div>
                                    <div className='col'>
                                        {taxTotal.toLocaleString('en-US', {
                                            style: 'currency',
                                            currency: 'USD',
                                        })}
                                    </div>
                                </div>
                                <div className='row'>
                                    <div className='col' />
                                    <div className='col'>
                                        <b>Total</b>
                                    </div>
                                    <div className='col'>
                                        <b>
                                            {(subTotal + taxTotal).toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            })}
                                        </b>
                                    </div>
                                    <div className='col' />
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col>
                    <Row>
                        <div className='table-wrapper'>
                            <div className='table table--no-head'>
                                <div className='main'>
                                    <Row>
                                        <Col>
                                            <b>Total amount:</b>
                                        </Col>
                                        <Col>
                                            {(subTotal + taxTotal).toLocaleString('en-US', {
                                                style: 'currency',
                                                currency: 'USD',
                                            })}
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <b>Status:</b>
                                        </Col>
                                        <Col>
                                            <Badge pill variant={this.props.statusMap[this.state.status].badge}>
                                                {this.props.statusMap[this.state.status].text}
                                            </Badge>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <b>Billing address:</b>
                                        </Col>
                                        <Col>
                                            {user.addressLineOne}, {user.addressLineTwo && user.addressLineTwo + ', '}
                                            {user.townCity}, {user.state}, {user.zipCode}
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </div>
                    </Row>
                    <Row className='items-spacing-right'>
                        {this.state.status && ['CANC', 'PAID'].indexOf(this.state.status) === -1 && (
                            <span
                                className='btn btn--secondary'
                                onClick={async () => {
                                    await this.props.changeInvoiceStatus(this.state._id, 'paid', async () => {
                                        await this.loadInvoice();
                                    });
                                }}>
                                <Fa icon={faCheckCircle} />
                                &nbsp;Mark As Paid
                            </span>
                        )}
                        {this.state.status && ['CANC', 'PAID'].indexOf(this.state.status) === -1 && (
                            <span
                                className='btn bp'
                                onClick={async () => {
                                    await this.props.changeInvoiceStatus(this.state._id, 'cancel', async () => {
                                        await this.loadInvoice();
                                    });
                                }}>
                                <Fa icon={faTimesCircle} />
                                &nbsp;Cancel
                            </span>
                        )}
                        <span className='btn btn--secondary btn--right'>
                            <Fa icon={faPrint} />
                            &nbsp;Print
                        </span>
                    </Row>
                </Col>
            </Row>
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
})(withRouter(Invoice));
