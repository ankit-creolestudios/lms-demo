import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApiTable } from '../../../components/ApiTable';
import apiCall from '../../../helpers/apiCall';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faClone as farClone } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

class CoreLibraryTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalShow: false,
            modalAction: null,
            modalType: '',
        };
    }

    componentDidMount = () => {
        this.props.pushBreadcrumbLink({
            text: 'Core Library',
            path: '/admin/core-library',
        });
    };

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Core Library',
            path: '/admin/core-library',
        });
    }

    duplicateCoreLibrary = async (docId, reloadTable) => {
        const { success, message } = await apiCall('POST', `/core/clone/${docId}/`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Folder has been duplicated',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Folder has not been duplicated. Please try again.',
            });
        }
    };

    deleteCoreLibrary = async (docId, reloadTable) => {
        const { success, message } = await apiCall('DELETE', `/core/${docId}`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Folder has been deleted',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Folder has not been deleted. Please try again.',
            });
        }
    };

    render() {
        return (
            <div>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    confirmAction={this.state.modalAction}
                    titleText={'Are you sure?'}
                    bodyText={[
                        'You are about to ',
                        <strong key='modal-type'>{this.state.modalType}</strong>,
                        ' this Core Library.',
                    ]}
                />
                <a className='btn bp btn--small' href={'/admin/core-library/create'}>
                    New Folder
                </a>
                <ApiTable
                    basePath='/admin/core-library'
                    apiCall={{
                        method: 'GET',
                        path: '/core',
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row) => (
                                <OverlayTrigger
                                    placement='top'
                                    overlay={
                                        <Tooltip id={`tooltip-${row._id}-edit-core-library)}`}>Edit Folder</Tooltip>
                                    }
                                >
                                    <Link className='btn btn--small' to={'/admin/core-library/edit/' + row._id}>
                                        <Fa icon={faEdit} />
                                    </Link>
                                </OverlayTrigger>
                            ),
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Folder',
                            field: 'title',
                            minWidth: '35%',
                            sortKey: 'title',
                        },
                        {
                            text: 'Last modified',
                            sortKey: 'updatedAt',
                            field: (row) => new Date(row.updatedAt).toLocaleString('en-US'),
                        },
                        {
                            text: 'Date created',
                            sortKey: 'createdAt',
                            field: (row) => new Date(row.createdAt).toLocaleString('en-US'),
                        },
                    ]}
                    rowButtons={[
                        {
                            type: 'button',
                            text: 'Duplicate Folder',
                            icon: farClone,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.duplicateCoreLibrary(doc._id, reload);
                                    },
                                    modalType: 'duplicate',
                                });
                            },
                        },
                        {
                            type: 'button',
                            text: 'Delete Folder',
                            icon: faTrash,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.deleteCoreLibrary(doc._id, reload);
                                    },
                                    modalType: 'delete',
                                });
                            },
                        },
                    ]}
                />
            </div>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(CoreLibraryTable);
