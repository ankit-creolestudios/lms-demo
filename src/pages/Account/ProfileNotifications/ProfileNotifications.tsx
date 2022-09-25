import React, { Component } from 'react';
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEnvelope, faInbox } from '@fortawesome/free-solid-svg-icons';
import './profileNotifications.scss';
import { Api } from 'src/helpers/new';
import AccountContext, { IAccountContext } from '../AccountContext';
import withContext from 'src/helpers/withContext';
import { ApiTable } from 'src/components/ApiTable';
interface IState {
    notifyData: any[];
    loading: boolean;
    reloadTable: number;
}

interface IProps {
    contextValue: IAccountContext;
}

class ProfileNotifications extends Component<IProps, IState> {
    static contextType = AccountContext;

    constructor(props: IProps) {
        super(props);
        this.state = {
            notifyData: [],
            loading: false,
            reloadTable: 0,
        };
    }

    componentDidMount = () => {
        this.setState({
            notifyData: this.context.notificationTabData,
        });
    };

    componentDidUpdate = (prevProps: IProps) => {
        if (prevProps.contextValue.notificationTabData !== this.props.contextValue.notificationTabData) {
            this.setState({
                notifyData: this.context.notificationTabData,
            });
        }
    };

    handleFormChange = async (
        e: React.ChangeEvent<HTMLInputElement>,
        mailingListId: string,
        silencedSubscriptions: string,
        row: any
    ) => {
        this.setState({
            loading: true,
        });
        const checkedValue = e.target.checked;
        let newSilencedSubscriptions = row.silencedSubscriptions;
        if (!checkedValue) {
            newSilencedSubscriptions.push(silencedSubscriptions);
        } else {
            newSilencedSubscriptions = newSilencedSubscriptions.filter(
                (data: string) => data !== silencedSubscriptions
            );
        }
        const payload = {
            isAdded: !checkedValue,
            silencedSubscriptions: newSilencedSubscriptions,
            mailingListId: mailingListId ?? '6303157e3d6d888ca85a6277',
        };
        const { success } = await Api.call('PATCH', '/users/notifications/update', payload);
        if (success) {
            if (silencedSubscriptions === 'email' && !checkedValue) {
                const { firstName, lastName, email } = this.context.detailsTabData;
                const payload = {
                    firstName,
                    lastName,
                    email,
                };
                Api.call('POST', `/mailingList/unsubscribers/${mailingListId}`, payload);
            } else if (silencedSubscriptions === 'email' && !!checkedValue) {
                const { firstName, lastName, email } = this.context.detailsTabData;
                const payload = {
                    firstName,
                    lastName,
                    email,
                };
                Api.call('POST', `/mailingList/subscribers/${mailingListId}`, payload);
            }
            await this.context.fetchUserDetails();
        }
        this.setState({
            loading: false,
            reloadTable: this.state.reloadTable + 1,
        });
    };

    render() {
        return (
            <>
                <h3>Your Notification Settings</h3>
                <ApiTable
                    reload={this.state.reloadTable}
                    basePath='/profile/notifications'
                    noSearch={true}
                    apiCall={{
                        method: 'GET',
                        path: '/user-mailingLists',
                        params: `${window.location.search}`,
                    }}
                    columns={[
                        {
                            text: 'Mailing Lists',
                            field: (row: any) => {
                                return (
                                    <div style={{ whiteSpace: 'initial', display: 'flex', flexDirection: 'column' }}>
                                        <h5>{row.name}</h5>
                                        <div>{row.description}</div>
                                    </div>
                                );
                            },
                            minWidth: '50%',
                        },
                        {
                            text: (
                                <OverlayTrigger
                                    key={`email`}
                                    placement='top'
                                    overlay={<Tooltip id={`email`}>Email</Tooltip>}
                                >
                                    <Fa icon={faEnvelope} style={{ marginRight: '10px' }} size={'2x'} />
                                </OverlayTrigger>
                            ),
                            field: (row: any) => (
                                <Form name={`${row._id}-email`}>
                                    <Form.Check
                                        name={`${row._id}-email`}
                                        type='checkbox'
                                        checked={!row.silencedSubscriptions.includes('email')}
                                        disabled={!row.isUnsubscriptionAllowed.includes('email')}
                                        onChange={(e) => this.handleFormChange(e, row._id, 'email', row)}
                                    />
                                </Form>
                            ),
                            maxWidth: '70px',
                        },
                        {
                            text: (
                                <OverlayTrigger
                                    key={`inbox`}
                                    placement='top'
                                    overlay={<Tooltip id={`inbox`}>Inbox</Tooltip>}
                                >
                                    <Fa icon={faInbox} size={'2x'} />
                                </OverlayTrigger>
                            ),
                            field: (row: any) => (
                                <Form name={`${row._id}-inbox`}>
                                    <Form.Check
                                        name={`${row._id}-inbox`}
                                        type='checkbox'
                                        checked={!row.silencedSubscriptions.includes('inbox')}
                                        disabled={!row.isUnsubscriptionAllowed.includes('inbox')}
                                        onChange={(e) => this.handleFormChange(e, row._id, 'inbox', row)}
                                    />
                                </Form>
                            ),
                        },
                    ]}
                />
            </>
        );
    }
}

export default withContext(ProfileNotifications, AccountContext);
