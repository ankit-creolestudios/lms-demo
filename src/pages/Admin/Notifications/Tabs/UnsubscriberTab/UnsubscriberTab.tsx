import React, { Component } from 'react';
import moment from 'moment';
import { ApiTable } from 'src/components/ApiTable';
import { getState } from 'src/helpers/localStorage';
import withContext from 'src/helpers/withContext';
import NotificationContext, { ContextType } from '../../NotificationContext';

interface IProps {
    contextValue: ContextType;
}

interface IState {
    reloadTable: number;
}
class UnsubscriberTab extends Component<IProps, IState> {
    static contextType = NotificationContext;

    constructor(props: any) {
        super(props);
        this.state = {
            reloadTable: 0,
        };
    }

    componentDidUpdate = (prevProps: IProps) => {
        if (prevProps.contextValue.reloadTable !== this.props.contextValue.reloadTable) {
            this.setState({
                reloadTable: this.state.reloadTable + 1,
            });
        }
    };

    render() {
        const mailingListId = this.context.selectedMailingListId
            ? this.context.selectedMailingListId
            : getState('selectedMailingListId');
        return (
            <div
                style={{
                    paddingTop: '20px',
                }}
            >
                <ApiTable
                    reload={this.state.reloadTable}
                    basePath='/admin/notifications/mailingList/edit/unsubscribers'
                    apiCall={{
                        method: 'GET',
                        path: `/mailingList/unsubscribers/${mailingListId}`,
                    }}
                    columns={[
                        {
                            text: 'First Name',
                            field: (row: any) => {
                                return row.firstName;
                            },
                        },
                        {
                            text: 'Last Name',
                            field: (row: any) => row.lastName,
                        },
                        {
                            text: 'Email Address',
                            field: (row: any) => row.email,
                        },
                        {
                            text: 'Subscribed at',
                            field: (row: any) => moment(row.createdAt).format('DD/MM/YYYY'),
                        },
                    ]}
                />
            </div>
        );
    }
}

export default withContext(UnsubscriberTab, NotificationContext);
