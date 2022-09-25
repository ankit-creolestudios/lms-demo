import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import TextInput from 'src/components/inputs/TextInput';
import { CheckboxInput } from 'src/components/_New/Form/CheckboxInput';
import { NumberInput } from 'src/components/_New/Form/NumberInput';
import { SelectInput } from 'src/components/_New/Form/SelectInput';
import { SwitchInput } from 'src/components/_New/Form/SwitchInput';
import NotificationContext from '../NotificationContext';

interface IProps {}

interface IState {
    modeSwitch: boolean;
}

export default class NotificationSetup extends Component<IProps, IState> {
    static contextType = NotificationContext;

    constructor(props: IProps) {
        super(props);
        this.state = {
            modeSwitch: false,
        };
    }
    render() {
        const { formOptions, notificationForm, handleNotificationForm } = this.context;

        const applicableItemsArr = formOptions.packages
            ? [
                  ...formOptions.packages.map((pkg: any) => ({
                      ...pkg,
                      type: 'package',
                  })),
                  ...formOptions.courses.map((pkg: any) => ({
                      ...pkg,
                      type: 'course',
                  })),
              ]
            : [];

        return (
            <div className='notification-setup'>
                <h4>Notification Setup</h4>
                <Row>
                    <Col sm={12}>
                        <TextInput name='Name' value={notificationForm?.name ?? ''} onChange={handleNotificationForm} />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <SelectInput
                            title='Send Condition'
                            optionData={formOptions?.sendMailConditions ?? []}
                            value={notificationForm?.sendCondition ?? ''}
                            handleChange={handleNotificationForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12}>
                        <SelectInput
                            title='Applicable Items'
                            optionData={applicableItemsArr}
                            value={notificationForm?.applicableItems ?? []}
                            handleChange={handleNotificationForm}
                            multiple={true}
                            optionLabel='title'
                            optionKey='_id'
                            extraLabelComp={() => (
                                <SwitchInput
                                    title={notificationForm?.modeSwitch ? 'Whitelist Mode' : 'Blacklist Mode'}
                                    checkedValue={notificationForm?.modeSwitch}
                                    handleClick={handleNotificationForm}
                                    name='Mode Switch'
                                />
                            )}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <SelectInput
                            title='Send Schedule'
                            optionData={['Before', 'After']}
                            value={notificationForm?.sendSchedule}
                            handleChange={handleNotificationForm}
                        />
                    </Col>
                    <Col sm={6}>
                        <NumberInput
                            title='Schedule Offset'
                            value={notificationForm?.scheduleOffset}
                            handleChange={handleNotificationForm}
                            min={0}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={3}>
                        <CheckboxInput
                            title='Send Method'
                            checboxData={formOptions?.mailSchedules ?? []}
                            handleChange={handleNotificationForm}
                            optionLabel='displayName'
                            optionKey='key'
                            checkValue={notificationForm}
                        />
                    </Col>
                    <Col sm={5}>
                        <SelectInput
                            title='Mailing List'
                            optionData={formOptions?.mailingLists ?? []}
                            value={notificationForm?.mailingList}
                            handleChange={handleNotificationForm}
                            optionLabel='name'
                            optionKey='_id'
                        />
                    </Col>
                    <Col sm={4}>
                        <SelectInput
                            title='Send Domain'
                            optionData={formOptions?.mailDomains ?? []}
                            value={notificationForm?.sendDomain ?? ''}
                            handleChange={handleNotificationForm}
                            optionLabel='displayName'
                            optionKey='key'
                        />
                    </Col>
                </Row>
            </div>
        );
    }
}
