//@ts-nocheck
import React, { Component } from 'react';
import { FormGroup, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Section from './Section';
import { IOptions } from '../../ReportingFields';
import { Capitalisation, DateFormat } from './options';
import './SourceOptions.scss';

interface IProps {
    index: number;
    closeSouceOptions: () => void;
    handleChange: (index: number, name: keyof IOptions, value: any) => void;
    options: IOptions;
}

export class SourceOptions extends Component<IProps, unknown> {
    handleChange = (key: keyof IOptions, value: any): void => {
        this.props.handleChange(this.props.index, key, value);
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.handleChange(e.target.name as keyof IOptions, e.target.value);
    };

    render() {
        const { options } = this.props;
        const dataType = this.props.options.type;

        return (
            <FormGroup className='source-options'>
                <FontAwesomeIcon icon={faTimes} onClick={this.props.closeSouceOptions} />
                {['string'].includes(dataType) && (
                    <Section label='Capitalisation'>
                        <Capitalisation handleChange={this.handleChange} selectedOption={options.capitalisation} />
                    </Section>
                )}
                {['date'].includes(dataType) && (
                    <Section label='Date Format'>
                        <Form.Label htmlFor='dateFormat'></Form.Label>
                        <Form.Control
                            type='text'
                            required
                            minLength={3}
                            maxLength={512}
                            id='dateFormat'
                            name='dateFormat'
                            value={options.dateFormat ?? 'MM/DD/YYYY'}
                            onChange={this.handleInputChange}
                        />
                    </Section>
                )}
                {['string', 'number', 'date'].includes(dataType) && (
                    <Section label='Custom Text'>
                        <Form.Label htmlFor='prependString'>Prepend</Form.Label>
                        <Form.Control
                            type='text'
                            required
                            minLength={3}
                            maxLength={512}
                            id='prependString'
                            name='prependString'
                            value={options.prependString ?? ''}
                            onChange={this.handleInputChange}
                        />
                        <Form.Label htmlFor='appendString'>Append</Form.Label>
                        <Form.Control
                            type='text'
                            required
                            minLength={3}
                            maxLength={512}
                            id='appendString'
                            name='appendString'
                            value={options.appendString ?? ''}
                            onChange={this.handleInputChange}
                        />
                    </Section>
                )}
            </FormGroup>
        );
    }
}
