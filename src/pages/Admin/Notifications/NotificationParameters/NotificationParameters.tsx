import { startCase } from 'lodash';
import React, { Component } from 'react';
import NotificationContext from '../NotificationContext';
import './notificationParameters.scss';

interface IState {
    parameters: ParamsType;
}

interface IProps {}

type ParamsType = {
    FIRST_NAME: string;
    LAST_NAME: string;
    EMAIL: string;
    PHONE_NUMBER: string;
    ADDRESS_1: string;
    ADDRESS_2: string;
    CITY: string;
    STATE: string;
    ZIP_CODE: string;
    COURSE_TITLE: string;
    COMPLETION_DATE: string;
    EXAM_STATUS: string;
    EXAM_SCORE: string;
    COURSE_EXPIRES_IN: string;
    COURSE_EXPIRES_DATE: string;
    TOKEN_URL: string;
};

export default class NotificationParameters extends Component<IProps, IState> {
    static contextType = NotificationContext;

    constructor(props: IProps) {
        super(props);
        this.state = {
            parameters: {
                FIRST_NAME: 'firstName',
                LAST_NAME: 'lastName',
                EMAIL: 'email',
                PHONE_NUMBER: 'phoneNumber',
                ADDRESS_1: 'addressLineOne',
                ADDRESS_2: 'addressLineTwo',
                CITY: 'townCity',
                STATE: 'state',
                ZIP_CODE: 'zipCode',
                COURSE_TITLE: 'courseTitle',
                COMPLETION_DATE: 'completionDate',
                EXAM_STATUS: 'examStatus',
                EXAM_SCORE: 'examScore',
                COURSE_EXPIRES_IN: 'courseExpiresIn',
                COURSE_EXPIRES_DATE: 'courseExpiryDate',
                TOKEN_URL: 'tokenUrl',
            },
        };
    }

    copyText = async (prm: string) => {
        await navigator.clipboard.writeText(`{{${prm}}}`);
    };

    render() {
        return (
            <div className='notification-parameters'>
                <h4>Parameters</h4>
                <div className='notification-parameters-container'>
                    {Object.values(this.state.parameters).map((prm, index) => (
                        <p key={index} onClick={() => this.copyText(prm)}>
                            {startCase(prm)}
                        </p>
                    ))}
                </div>
            </div>
        );
    }
}
