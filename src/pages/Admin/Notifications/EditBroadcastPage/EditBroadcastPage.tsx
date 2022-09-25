import { startCase } from 'lodash';
import moment from 'moment';
import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getState, setState } from 'src/helpers/localStorage';
import { Api, EventBus } from 'src/helpers/new';
import BroadcastForm from '../BroadcastForm/BroadcastForm';
import NotificationContext from '../NotificationContext';
import NotificationParameters from '../NotificationParameters/NotificationParameters';
import { IConnectProps } from '../Notifications';
import './editBroadcastPage.scss';

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

class EditBroadcastPage extends Component<IProps> {
    static contextType = NotificationContext;

    componentDidMount = async () => {
        const { action } = this.props.match.params;
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
            text: 'Broadcast',
            path: '/admin/notifications/broadcast',
        });
        this.props.pushBreadcrumbLink({
            text:
                this.props.match.params.action === 'add'
                    ? 'Add Broadcast'
                    : this.props.match.params.action === 'edit' && 'Edit Broadcast',
            path:
                this.props.match.params.action === 'add'
                    ? '/admin/notifications/broadcast/add'
                    : this.props.match.params.action === 'edit' && '/admin/notifications/broadcast/edit',
        });
        action === 'edit' && (await this.context.fetchBroadcastData());
    };

    componentWillUnmount = () => {
        this.props.setFormActions({
            customButtons: [],
        });
        this.props.removeBreadcrumbLink({
            text: 'Broadcast',
            path: '/admin/notifications/broadcast',
        });
        this.props.removeBreadcrumbLink({
            text:
                this.props.match.params.action === 'add'
                    ? 'Add Broadcast'
                    : this.props.match.params.action === 'edit' && 'Edit Broadcast',
            path:
                this.props.match.params.action === 'add'
                    ? '/admin/notifications/broadcast/add'
                    : this.props.match.params.action === 'edit' && '/admin/notifications/broadcast/edit',
        });
        this.context.updateNotificationState('selectedBroadcastId', '');
        setState('selectedBroadcastId', '');
        this.context.resetBroadcastForm();
    };

    checkAllFields = () => {
        const { broadCastForm } = this.context;
        const {
            name,
            sendDate,
            email,
            inbox,
            mailingList,
            sendDomain,
            useHeader,
            useFooter,
            subject,
            preHeader,
            messageBody,
        } = broadCastForm;

        if (!name) {
            return 'name';
        } else if (!sendDate) {
            return 'sendCondition';
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

        const { broadCastForm, parameters } = this.context;
        const {
            name,
            sendDate,
            email,
            inbox,
            mailingList,
            sendDomain,
            useHeader,
            useFooter,
            subject,
            preHeader,
            messageBody,
        } = broadCastForm;

        const { action } = this.props.match.params;
        const url =
            action === 'add'
                ? `/broadcast/create`
                : `/broadcast/update/${this.context.selectedBroadcastId ?? getState('selectedBroadcastId')}`;
        const method = action === 'add' ? 'POST' : 'PUT';

        const dynamicKeys = [];
        for (let i = 0; i < parameters.length; i++) {
            const mainString = subject + preHeader + messageBody;
            if (mainString.includes(this.context.parameters[i])) {
                dynamicKeys.push(this.context.parameters[i]);
            }
        }

        const payload = {
            name: name,
            sendDate: moment(sendDate).format('YYYY-MM-DD'),
            sendMethod: [email && 'email', inbox && 'inbox'],
            mailingListId: mailingList,
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
            this.props.history.push('/admin/notifications/broadcast');
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
                        <BroadcastForm />
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
})(EditBroadcastPage);
