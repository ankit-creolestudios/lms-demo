import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import Editor from 'src/components/Editor';
import TextInput from 'src/components/inputs/TextInput';
import { SelectInput } from 'src/components/_New/Form/SelectInput';
import NotificationContext from '../NotificationContext';

export default class BroadcastContent extends Component {
    static contextType = NotificationContext;

    render() {
        const { broadCastForm, handleBroadcastForm } = this.context;

        return (
            <div className='broadcast-content'>
                <h4>Broadcast Content</h4>
                <Row>
                    <Col sm={6}>
                        <SelectInput
                            title='Use Header'
                            optionData={[]}
                            value={broadCastForm?.useHeader ?? ''}
                            handleChange={handleBroadcastForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                    <Col sm={6}>
                        <SelectInput
                            title='Use Footer'
                            optionData={[]}
                            value={broadCastForm?.useFooter ?? ''}
                            handleChange={handleBroadcastForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <TextInput name='Subject' value={broadCastForm?.subject ?? ''} onChange={handleBroadcastForm} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <TextInput
                            name='Pre Header'
                            value={broadCastForm?.preHeader ?? ''}
                            onChange={handleBroadcastForm}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <div className='form__field'>
                            <label htmlFor='messageBody'>Message Body</label>
                            <Editor
                                defaultValue={broadCastForm?.messageBody ?? ''}
                                name='messageBody'
                                onChange={(e: any) => handleBroadcastForm('messageBody', e.target.value)}
                                disableInsertImage={true}
                                disableInsertTable={true}
                            />
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
