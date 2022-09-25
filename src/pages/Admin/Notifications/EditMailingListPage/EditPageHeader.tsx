import { camelCase, capitalize } from 'lodash';
import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import TextInput from 'src/components/inputs/TextInput';
import { getState } from 'src/helpers/localStorage';
import { Api } from 'src/helpers/new';
import NotificationContext from '../NotificationContext';
import { IConnectProps } from '../Notifications';

interface IProps extends RouteComponentProps {
    match: {
        isExact: true;
        path: '';
        url: '';
        params: {
            action: string;
            tab: string;
        };
    };
}

interface IState {
    showModal: boolean;
    modalFormData: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

class EditPageHeader extends Component<IProps, IState> {
    static contextType = NotificationContext;

    constructor(props: any) {
        super(props);
        this.state = {
            showModal: false,
            modalFormData: {
                firstName: '',
                lastName: '',
                email: '',
            },
        };
    }

    toggleModal = () => {
        this.setState({
            showModal: !this.state.showModal,
            modalFormData: {
                firstName: '',
                lastName: '',
                email: '',
            },
        });
    };

    handleFormChange = (e: React.ChangeEvent<HTMLInputElement>, value: string) => {
        const mainKey = camelCase(e.target.name);
        this.setState({
            modalFormData: {
                ...this.state.modalFormData,
                [mainKey]: value,
            },
        });
    };

    handleFormSave = async () => {
        const { tab } = this.props.match.params;
        const mailingListId = this.context.selectedMailingListId
            ? this.context.selectedMailingListId
            : getState('selectedMailingListId');
        const url = `/mailingList/${tab}/${mailingListId}`;
        const payload = this.state.modalFormData;

        const { success } = await Api.call('POST', url, payload);

        if (success) {
            this.toggleModal();
            this.context.updateNotificationState('reloadTable', this.context.reloadTable + 1);
        }
    };

    render() {
        const { action, tab } = this.props.match.params;
        const { modalFormData } = this.state;

        return (
            <div className='editpage-header'>
                {action === 'edit' &&
                    (tab === 'setup' ? (
                        <h3>Setup</h3>
                    ) : tab === 'subscribers' ? (
                        <>
                            <h3>Subscribers</h3>
                            <p className='btn bp btn--small' onClick={this.toggleModal}>
                                New Subscriber
                            </p>
                        </>
                    ) : (
                        tab === 'unsubscribers' && (
                            <>
                                <h3>Unsubscribers</h3>
                                <p className='btn bp btn--small' onClick={this.toggleModal}>
                                    New Unsubscriber
                                </p>
                            </>
                        )
                    ))}
                <Modal show={this.state.showModal} onHide={this.toggleModal}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create {capitalize(tab)}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <TextInput name='FirstName' value={modalFormData.firstName} onChange={this.handleFormChange} />
                        <TextInput name='LastName' value={modalFormData.lastName} onChange={this.handleFormChange} />
                        <TextInput
                            type='email'
                            name='Email'
                            value={modalFormData.email}
                            onChange={this.handleFormChange}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='primary' onClick={this.toggleModal}>
                            Cancel
                        </Button>
                        <Button variant='secondary' onClick={this.handleFormSave}>
                            Create
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}

export default withRouter(EditPageHeader);
