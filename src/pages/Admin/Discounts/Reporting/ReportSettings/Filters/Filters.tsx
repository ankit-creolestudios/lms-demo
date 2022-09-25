import React, { Component } from 'react';
import { Form, Col, Row, FormGroup } from 'react-bootstrap';
import DatePicker from 'src/components/DatePicker/DatePicker';

export interface IFilters {
    reportTitle: string;
    createdStart?: Date;
    createdEnd?: Date;
    valid?: 'valid' | 'invalid' | 'all';
    usage?: 'unused' | 'used' | 'all';
}

interface IProps {
    filters: IFilters;
    onChange: (ReportSettings: IFilters) => void;
}

export default class Filters extends Component<IProps> {
    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const filters = Object.assign(this.props.filters);
        filters[e.target.name] = e.target.value;
        this.props.onChange(filters);
    };

    handleDateChange = (name: 'createdStart' | 'createdEnd', date: Date): void => {
        this.props.onChange({
            ...this.props.filters,
            [name]: date,
        });
    };

    render() {
        const { reportTitle, createdStart, createdEnd, valid, usage } = this.props.filters;

        return (
            <Form id='courseForm'>
                <Row className='pt-4'>
                    <Col lg={3}>
                        <FormGroup>
                            <Form.Label htmlFor='reportTitle'>Title</Form.Label>
                            <Form.Control
                                type='text'
                                required
                                minLength={3}
                                maxLength={512}
                                id='reportTitle'
                                name='reportTitle'
                                value={reportTitle}
                                onChange={this.handleChange}
                            />
                        </FormGroup>
                    </Col>
                </Row>
                <Row className='pt-2'>
                    <Col lg={2}>
                        <DatePicker
                            raw
                            id='createdStart'
                            handleDateChange={this.handleDateChange}
                            date={createdStart}
                            label='Created after'
                        />
                    </Col>
                    <Col lg={2}>
                        <DatePicker
                            raw
                            id='createdEnd'
                            handleDateChange={this.handleDateChange}
                            date={createdEnd}
                            label='Created before'
                        />
                    </Col>
                </Row>
                <Row className='pt-2'>
                    <Col lg={2}>
                        <FormGroup>
                            <Form.Label htmlFor='valid'>Validity</Form.Label>
                            <Form.Control
                                as='select'
                                id='valid'
                                name='valid'
                                value={valid}
                                onChange={this.handleChange}
                            >
                                <option value='valid'>Valid</option>
                                <option value='invalid'>Invalid</option>
                                <option value='all'>All</option>
                            </Form.Control>
                        </FormGroup>
                    </Col>
                    <Col lg={2}>
                        <FormGroup>
                            <Form.Label htmlFor='usage'>Usage</Form.Label>
                            <Form.Control
                                as='select'
                                id='usage'
                                name='usage'
                                value={usage}
                                onChange={this.handleChange}
                            >
                                <option value='unused'>Unused</option>
                                <option value='used'>Used</option>
                                <option value='all'>All</option>
                            </Form.Control>
                        </FormGroup>
                    </Col>
                </Row>
            </Form>
        );
    }
}
