import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import NotificationForm from '../NotificationForm/NotificationForm';
import NotificationParameters from '../NotificationParameters/NotificationParameters';
import { IConnectProps } from '../Notifications';
import './editNotificationsPage.scss';
import NotificationContext from '../NotificationContext';
import { Api, EventBus } from 'src/helpers/new';
import { lowerCase, startCase } from 'lodash';
import { getState, setState } from 'src/helpers/localStorage';
import withContext from 'src/helpers/withContext';

interface IRouteProps {
    match: {
        params: {
            action: string;
        };
    };
    history: {
        push: (path: string) => void;
        replace: (path: string) => void;
    };
}

interface IProps extends IRouteProps, IConnectProps {}

class EditNotificationPage extends Component<IProps, any> {
    static contextType = NotificationContext;

    componentDidMount = async () => {
        const { action } = this.props.match.params;
        if (['add', 'edit'].includes(action)) {
            this.props.setFormActions({
                customButtons: [
                    {
                        label: 'Save',
                        onClick: this.handleFormSave,
                        disabled: !['add', 'edit'].includes(action),
                    },
                ],
            });
            this.props.pushBreadcrumbLink({
                text:
                    this.props.match.params.action === 'add'
                        ? 'Add Notification'
                        : this.props.match.params.action === 'edit' && 'Edit Notification',
                path:
                    this.props.match.params.action === 'add'
                        ? '/admin/notifications/add'
                        : this.props.match.params.action === 'edit' && '/admin/notifications/edit',
            });
            action === 'edit' && (await this.context.fetchNotificationData());
        }
    };

    componentWillUnmount = () => {
        this.props.setFormActions({
            customButtons: [],
        });
        this.props.removeBreadcrumbLink({
            text:
                this.props.match.params.action === 'add'
                    ? 'Add Notification'
                    : this.props.match.params.action === 'edit' && 'Edit Notification',
            path:
                this.props.match.params.action === 'add'
                    ? '/admin/notifications/add'
                    : this.props.match.params.action === 'edit' && '/admin/notifications/edit',
        });
        this.context.updateNotificationState('selectedNotificationId', '');
        setState('selectedNotificationId', '');
        this.context.resetNotificationForm();
    };

    checkAllFields = () => {
        const { notificationForm } = this.context;
        const {
            name,
            sendCondition,
            sendSchedule,
            scheduleOffset,
            mailingList,
            email,
            inbox,
            sendDomain,
            useHeader,
            useFooter,
            subject,
            preHeader,
            messageBody,
        } = notificationForm;

        if (!name) {
            return 'name';
        } else if (!sendCondition) {
            return 'sendCondition';
        } else if (!sendSchedule) {
            return 'sendSchedule';
        } else if (!scheduleOffset?.toString()) {
            return 'scheduleOffset';
        } else if (!(email || inbox)) {
            return 'sendMethod';
        } else if (!mailingList) {
            return 'mailingList';
        } else if (!sendDomain) {
            return 'sendDomain';
        } else if (!useHeader) {
            return 'useHeader';
        } else if (!useFooter) {
            return 'useFooter';
        } else if (!subject) {
            return 'subject';
        } else if (!preHeader) {
            return 'preHeader';
        } else if (!messageBody) {
            return 'messageBody';
        } else {
            return '';
        }
    };

    handleFormSave = async () => {
        const errorMsg = this.checkAllFields();

        if (!!errorMsg) {
            EventBus.dispatch('toast', {
                type: 'warning',
                message: `${startCase(errorMsg)}: Field is empty`,
            });
            return;
        }

        const { notificationForm, formOptions, parameters } = this.context;
        const {
            name,
            sendCondition,
            sendSchedule,
            scheduleOffset,
            mailingList,
            email,
            inbox,
            sendDomain,
            useHeader,
            useFooter,
            subject,
            preHeader,
            messageBody,
            modeSwitch,
            applicableItems,
        } = notificationForm;

        const { action } = this.props.match.params;
        const url =
            action === 'add'
                ? `/notifications/create`
                : `/notifications/update/${this.context.selectedNotificationId ?? getState('selectedNotificationId')}`;
        const method = action === 'add' ? 'POST' : 'PATCH';
        const allApplicableItems = [
            ...formOptions.courses.map((course: any) => ({
                ...course,
                type: 'course',
            })),
            ...formOptions.packages.map((pkg: any) => ({
                ...pkg,
                type: 'package',
            })),
        ];
        const whiteListData = [];
        const blackListData = [];

        if (modeSwitch) {
            for (let i = 0; i < allApplicableItems.length; i++) {
                if (applicableItems.includes(allApplicableItems[i]._id)) {
                    whiteListData.push({
                        itemId: allApplicableItems[i]._id,
                        itemType: allApplicableItems[i].type,
                    });
                } else {
                    blackListData.push({
                        itemId: allApplicableItems[i]._id,
                        itemType: allApplicableItems[i].type,
                    });
                }
            }
        } else {
            for (let i = 0; i < allApplicableItems.length; i++) {
                if (applicableItems.includes(allApplicableItems[i]._id)) {
                    blackListData.push({
                        itemId: allApplicableItems[i]._id,
                        itemType: allApplicableItems[i].type,
                    });
                } else {
                    whiteListData.push({
                        itemId: allApplicableItems[i]._id,
                        itemType: allApplicableItems[i].type,
                    });
                }
            }
        }

        const dynamicKeys = [];
        for (let i = 0; i < parameters.length; i++) {
            const mainString = subject + preHeader + messageBody;
            if (mainString.includes(this.context.parameters[i])) {
                dynamicKeys.push(this.context.parameters[i]);
            }
        }

        const payload = {
            name: name,
            sendCondition: formOptions.sendMailConditions.find((condition: any) => condition.key === sendCondition),
            mailSendMode: modeSwitch ? 'whitelist' : 'blacklist',
            whitelist: whiteListData,
            blacklist: blackListData,
            sendSchedule: lowerCase(sendSchedule),
            sendOffsetDays: scheduleOffset,
            mailingListId: mailingList,
            sendMethod: [email && 'email', inbox && 'inbox'],
            sendDomain: sendDomain,
            mailHeader: useHeader,
            mailFooter: useFooter,
            mailSubject: subject,
            mailPreHeader: preHeader,
            mailBody: messageBody,
            dynamicKeys: dynamicKeys,
        };
        const { success } = await Api.call(method, url, payload);
        if (success) {
            this.props.history.push('/admin/notifications');
        }
    };

    render() {
        if (!['add', 'edit'].includes(this.props.match.params.action)) {
            return <></>;
        }

        return (
            <div className='edit-notifications-page'>
                <Row>
                    <Col md={8}>
                        <NotificationForm />
                    </Col>
                    <Col md={4}>
                        <NotificationParameters />
                    </Col>
                </Row>
            </div>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setFormActions: (payload: any) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(withContext(EditNotificationPage, NotificationContext));
