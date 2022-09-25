import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import Editor from 'src/components/Editor';
import TextInput from 'src/components/inputs/TextInput';
import { SelectInput } from 'src/components/_New/Form/SelectInput';
import NotificationContext from '../NotificationContext';

export default class NotificationContent extends Component {
    static contextType = NotificationContext;

    render() {
        const { notificationForm, handleNotificationForm } = this.context;

        return (
            <div className='notification-content'>
                <h4>Notification Content</h4>
                <Row>
                    <Col sm={6}>
                        <SelectInput
                            title='Use Header'
                            optionData={[]}
                            value={notificationForm?.useHeader ?? ''}
                            handleChange={handleNotificationForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                    <Col sm={6}>
                        <SelectInput
                            title='Use Footer'
                            optionData={[]}
                            value={notificationForm?.useFooter ?? ''}
                            handleChange={handleNotificationForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <TextInput
                            name='Subject'
                            value={notificationForm?.subject ?? ''}
                            onChange={handleNotificationForm}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <TextInput
                            name='Pre Header'
                            value={notificationForm?.preHeader ?? ''}
                            onChange={handleNotificationForm}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <div className='form__field'>
                            <label htmlFor='messageBody'>Message Body</label>
                            <Editor
                                defaultValue={notificationForm?.messageBody ?? ''}
                                name='messageBody'
                                onChange={(e: any) => handleNotificationForm('messageBody', e.target.value)}
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
