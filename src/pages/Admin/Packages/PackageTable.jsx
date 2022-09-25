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

class PackageTable extends Component {
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
            text: 'Packages',
            path: '/admin/packages',
        });
    };

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Packages',
            path: '/admin/packages',
        });
    }

    duplicatePackage = async (docId, reloadTable) => {
        const { success, message } = await apiCall('POST', `/packages/${docId}/clone`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Package has been duplicated',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Package has not been duplicated. Please try again.',
            });
        }
    };

    deletePackage = async (docId, reloadTable) => {
        const { success, message } = await apiCall('DELETE', `/packages/${docId}`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Package has been deleted',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Package has not been deleted. Please try again.',
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
                        ' this Package.',
                    ]}
                />
                <a className='btn bp btn--small' href={'/admin/packages/create'}>
                    New Package
                </a>
                <ApiTable
                    basePath='/admin/packages'
                    apiCall={{
                        method: 'GET',
                        path: '/packages',
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row) => (
                                <OverlayTrigger
                                    placement='top'
                                    overlay={<Tooltip id={`tooltip-${row._id}-edit-package)}`}>Edit package</Tooltip>}>
                                    <Link className='btn btn--small' to={'/admin/packages/edit/' + row._id}>
                                        <Fa icon={faEdit} />
                                    </Link>
                                </OverlayTrigger>
                            ),
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Title',
                            field: 'title',
                            minWidth: '45%',
                            sortKey: 'title',
                        },
                        {
                            text: 'Status',
                            field: (row) => {
                                const now = new Date().toISOString();
                                return row.publishDate &&
                                    row.publishDate <= now &&
                                    (!row.unpublishDate || now < row.unpublishDate)
                                    ? 'Published'
                                    : 'Unpublished';
                            },
                        },
                        {
                            text: 'Created at',
                            field: (row) => new Date(row.createdAt).toLocaleString('en-US'),
                            sortKey: 'createdAt',
                        },
                    ]}
                    rowButtons={[
                        {
                            type: 'button',
                            text: 'Duplicate package',
                            icon: farClone,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.duplicatePackage(doc._id, reload);
                                    },
                                    modalType: 'duplicate',
                                });
                            },
                        },
                        {
                            type: 'button',
                            text: 'Delete package',
                            icon: faTrash,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.deletePackage(doc._id, reload);
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
})(PackageTable);
