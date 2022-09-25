import React, { Component } from 'react';
import { ApiTable } from '../../../../../components/ApiTable';
import { Spinner } from '../../../../../components/Spinner';
import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import apiCall from '../../../../../helpers/apiCall';
import './Templates.scss';

interface Istate {
    isLoading: boolean;
}

class Templates extends Component<RouteComponentProps<any>, Istate> {
    state: Istate = {
        isLoading: false,
    };

    newTemplate = async (): Promise<void> => {
        const { success, response } = await apiCall('post', '/reporting/templates');
        if (success) {
            this.props.history.replace(`/admin/reporting/templates/${response._id}`);
        }
    };

    deleteTemplate = async (_: any, template: any, reload: () => void): Promise<void> => {
        const { success, response } = await apiCall('delete', `/reporting/templates/${template._id}`);
        if (success) {
            reload();
        }
    };

    public render() {
        if (this.state.isLoading) {
            return <Spinner />;
        } else {
            return (
                <ApiTable
                    noSearch={true}
                    addNew={{
                        label: 'New Template',
                        action: this.newTemplate,
                    }}
                    apiCall={{
                        method: 'GET',
                        path: '/reporting/templates',
                    }}
                    columns={[
                        {
                            text: 'Title',
                            field: (row: any) => <span>{row.title}</span>,
                            minWidth: '40%',
                        },
                        {
                            text: 'Created at',
                            field: (row: any) => <span>{new Date(row.createdAt).toLocaleString()}</span>,
                        },
                    ]}
                    rowButtons={[
                        {
                            type: 'button',
                            text: 'Edit Template',
                            icon: faPencilAlt,
                            url: '/admin/reporting/templates/:_id',
                        },
                        {
                            type: 'button',
                            text: 'Delete Template',
                            icon: faTrash,
                            clickCallback: this.deleteTemplate,
                        },
                    ]}
                />
            );
        }
    }
}

export default withRouter(Templates);
