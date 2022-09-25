import React, { Component } from 'react';
import { Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import TextInput from 'src/components/inputs/TextInput';
import { CheckboxInput } from 'src/components/_New/Form/CheckboxInput';
import { getState } from 'src/helpers/localStorage';
import { Api, EventBus } from 'src/helpers/new';
import NotificationContext from '../../NotificationContext';
import { IConnectProps } from '../../Notifications';

interface IProps extends RouteComponentProps, IConnectProps {
    match: {
        isExact: true;
        path: string;
        url: string;
        params: {
            action: string;
            tab: string;
        };
    };
}

interface IState {}
class SetupTab extends Component<IProps, IState> {
    static contextType = NotificationContext;

    componentDidMount = () => {
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
        }
    };

    componentWillUnmount = () => {
        this.props.setFormActions({
            customButtons: [],
        });
    };

    handleFormSave = async () => {
        const { action } = this.props.match.params;
        const { setupForm, selectedMailingListId } = this.context;

        if (!(!!setupForm?.name && !!setupForm?.description && (setupForm.email || setupForm.inbox))) {
            EventBus.dispatch('toast', {
                type: 'warning',
                message: 'Please fill all the Fields',
            });
            return;
        }

        const payload = {
            name: setupForm.name,
            description: setupForm.description,
            isUnsubscriptionAllowed: [setupForm.email && 'email', setupForm.inbox && 'inbox'].filter((data) => !!data),
        };

        const mailingListId = selectedMailingListId
            ? this.context.selectedMailingListId
            : getState('selectedMailingListId');

        const url = action === 'add' ? '/mailingList/create' : `/mailingList/update/${mailingListId}`;
        const method = action === 'add' ? 'POST' : 'PUT';

        await Api.call(method, url, payload);

        this.props.history.push('/admin/notifications/mailingList');
    };

    render() {
        const { setupForm, handleSetupForm } = this.context;

        return (
            <div className='setup-tab'>
                <Row>
                    <TextInput name='Name' value={setupForm?.name ?? ''} onChange={handleSetupForm} />
                </Row>
                <Row>
                    <TextInput name='Description' value={setupForm?.description ?? ''} onChange={handleSetupForm} />
                </Row>
                <Row>
                    <CheckboxInput
                        title='Unsubscription/ Silencing Allowed'
                        checboxData={['Email', 'Inbox']}
                        handleChange={handleSetupForm}
                        checkValue={setupForm}
                    />
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
})(withRouter(SetupTab));
