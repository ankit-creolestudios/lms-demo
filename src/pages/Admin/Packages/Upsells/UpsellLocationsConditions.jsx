import React, { Component } from 'react';
import { Col, Row, Form, FormGroup } from 'react-bootstrap';
import PackageContext from '../PackageContext';
import apiCall from '../../../../helpers/apiCall';
import { withRouter } from 'react-router-dom';

class UpsellLocationsConditions extends Component {
    static contextType = PackageContext;

    locationUpsellTypes = [
        {
            key: 'ALL',
            text: 'All products',
        },
        {
            key: 'SAME_ONLY',
            text: 'Same-division only',
        },
        {
            key: 'CROSS_ONLY',
            text: 'Cross-division only',
        },
        {
            key: 'SAME_PRIO',
            text: 'Same-division prioritised',
        },
        {
            key: 'CROSS_PRIO',
            text: 'Cross-division prioritised',
        },
    ];

    handleChange = async (e) => {
        const locationsUpsellsType = {
            ...this.context.packageData.locationsUpsellsType,
            [e.target.name]: e.target.value,
        };

        await apiCall('PUT', `/packages/${this.props.match.params.id}`, {
            locationsUpsellsType,
        });

        this.context.setPackage({
            locationsUpsellsType,
        });
    };

    render() {
        const { cart, suggestion, thankYou, dashboard } = {
            cart: 'ALL',
            suggestion: 'ALL',
            thankYou: 'ALL',
            dashboard: 'ALL',
            ...this.context.packageData.locationsUpsellsType,
        };

        return (
            <>
                <Row>
                    <Col>
                        <FormGroup>
                            <Form.Label htmlFor='cart'>Cart</Form.Label>
                            <Form.Control
                                as='select'
                                required
                                id='cart'
                                name='cart'
                                value={cart}
                                onChange={this.handleChange}>
                                {this.locationUpsellTypes.map(({ key, text }) => (
                                    <option key={key} value={key}>
                                        {text}
                                    </option>
                                ))}
                            </Form.Control>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Form.Label htmlFor='thankYou'>Thank you</Form.Label>
                            <Form.Control
                                as='select'
                                required
                                id='thankYou'
                                name='thankYou'
                                value={thankYou}
                                onChange={this.handleChange}>
                                {this.locationUpsellTypes.map(({ key, text }) => (
                                    <option key={key} value={key}>
                                        {text}
                                    </option>
                                ))}
                            </Form.Control>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <FormGroup>
                            <Form.Label htmlFor='suggestion'>Suggestion</Form.Label>
                            <Form.Control
                                as='select'
                                required
                                id='suggestion'
                                name='suggestion'
                                value={suggestion}
                                onChange={this.handleChange}>
                                {this.locationUpsellTypes.map(({ key, text }) => (
                                    <option key={key} value={key}>
                                        {text}
                                    </option>
                                ))}
                            </Form.Control>
                        </FormGroup>
                    </Col>
                    <Col>
                        <FormGroup>
                            <Form.Label htmlFor='dashboard'>Dashboard</Form.Label>
                            <Form.Control
                                as='select'
                                required
                                id='dashboard'
                                name='dashboard'
                                value={dashboard}
                                onChange={this.handleChange}>
                                {this.locationUpsellTypes.map(({ key, text }) => (
                                    <option key={key} value={key}>
                                        {text}
                                    </option>
                                ))}
                            </Form.Control>
                        </FormGroup>
                    </Col>
                </Row>
            </>
        );
    }
}

export default withRouter(UpsellLocationsConditions);
