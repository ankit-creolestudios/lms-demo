import React, { Component } from 'react';
import { ApiTable } from '../../../../components/ApiTable';
import { faTrash, faDownload } from '@fortawesome/free-solid-svg-icons';
import apiCall from '../../../../helpers/apiCall';

export default class History extends Component<unknown, unknown> {
    downloadReport = (file: any): void => {
        const base = process.env.REACT_APP_STORAGE_URL_BASE;
        const url = `${base + file.destinationContainer}/${file.originalName}-${file._id}.${file.fileExtension}`;
        window.open(url, '_blank');
    };

    deleteReport = async (reportId: string, reload: () => void): Promise<void> => {
        const { success, response } = await apiCall('delete', `/reporting/${reportId}`);
        if (success) {
            reload();
        }
    };

    public render() {
        return (
            <ApiTable
                noSearch={true}
                apiCall={{
                    method: 'GET',
                    path: '/reporting/history',
                }}
                columns={[
                    {
                        text: 'Course',
                        field: (row: any) => <span>{row.course.title}</span>,
                        minWidth: '40%',
                    },
                    {
                        text: 'Title',
                        field: (row: any) => <span>{row.title}</span>,
                    },
                    {
                        text: 'Format',
                        field: (row: any) => <span>{row.format}</span>,
                    },
                    {
                        text: 'Created at',
                        field: (row: any) => <span>{new Date(row.createdAt).toLocaleString()}</span>,
                    },
                ]}
                rowButtons={[
                    {
                        type: 'button',
                        text: 'Download Report',
                        icon: faDownload,
                        clickCallback: (e: React.MouseEvent<any>, doc: any, reload: () => void) => {
                            this.downloadReport(doc.file);
                        },
                    },
                    {
                        type: 'button',
                        text: 'Delete Report',
                        icon: faTrash,
                        clickCallback: (e: React.MouseEvent<any>, doc: any, reload: () => void) => {
                            this.deleteReport(doc._id, reload);
                        },
                    },
                ]}
            />
        );
    }
}
