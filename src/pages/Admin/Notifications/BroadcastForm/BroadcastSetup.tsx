import { camelCase } from 'lodash';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { RouteComponentProps } from 'react-router-dom';
import DatePicker from 'src/components/DatePicker/DatePicker';
import TextInput from 'src/components/inputs/TextInput';
import { CheckboxInput } from 'src/components/_New/Form/CheckboxInput';
import { SelectInput } from 'src/components/_New/Form/SelectInput';
import NotificationContext from '../NotificationContext';

interface IProps {}

interface IState {
    modeSwitch: boolean;
}

export default class BroadcastSetup extends Component<IProps, IState> {
    static contextType = NotificationContext;

    render() {
        const { formOptions, broadCastForm, handleBroadcastForm } = this.context;

        return (
            <div className='broadcast-setup'>
                <h4>Broadcast Setup</h4>
                <Row>
                    <Col sm={6}>
                        <TextInput name='Name' value={broadCastForm?.name ?? ''} onChange={handleBroadcastForm} />
                    </Col>
                    <Col sm={6}>
                        <div className='form__field'>
                            <label htmlFor={camelCase('Send Date')}>Send Date</label>
                            <DatePicker
                                required
                                name={camelCase('Send Date')}
                                onChange={(e: any) => handleBroadcastForm(camelCase('Send Date'), e.target.value)}
                                date={broadCastForm?.sendDate ?? ''}
                                showClearDate
                            />
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <CheckboxInput
                            title='Send Method'
                            checboxData={formOptions?.mailSchedules ?? []}
                            handleChange={handleBroadcastForm}
                            optionLabel='displayName'
                            optionKey='key'
                            checkValue={broadCastForm}
                        />
                    </Col>
                    <Col sm={5}>
                        <SelectInput
                            title='Mailing List'
                            optionData={formOptions?.mailingLists ?? []}
                            value={broadCastForm?.mailingList ?? ''}
                            handleChange={handleBroadcastForm}
                            optionLabel='name'
                            optionKey='_id'
                        />
                    </Col>
                    <Col sm={4}>
                        <SelectInput
                            title='Send Domain'
                            optionData={formOptions?.mailDomains ?? []}
                            value={broadCastForm?.sendDomain ?? ''}
                            handleChange={handleBroadcastForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}
