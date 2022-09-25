import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ApiTable } from '../../../components/ApiTable';
import apiCall from '../../../helpers/apiCall';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faEdit, faUserGraduate, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faClone as farClone } from '@fortawesome/free-regular-svg-icons';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

class CourseTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modalShow: false,
            modalAction: null,
            modalType: '',
        };
    }

    duplicateCourse = async (docId, reloadTable) => {
        const { success, message } = await apiCall('POST', `/courses/${docId}/clone`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Course has been duplicated',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Course has not been duplicated. Please try again.',
            });
        }
    };

    deleteCourse = async (docId, reloadTable) => {
        const { success, message } = await apiCall('DELETE', `/courses/${docId}`);

        if (success) {
            this.setState({
                modalShow: false,
            });
            await reloadTable();
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Course has been deleted',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'Course has not been deleted. Please try again.',
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
                        ' this Course.',
                    ]}
                />
                <a className='btn bp btn--small' href={'/admin/courses/new'}>
                    New Course
                </a>
                <ApiTable
                    basePath='/admin/courses'
                    apiCall={{
                        method: 'GET',
                        path: '/courses',
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row) => (
                                <OverlayTrigger
                                    placement='top'
                                    overlay={<Tooltip id={`tooltip-${row._id}-edit-course)}`}>Edit course</Tooltip>}
                                >
                                    <Link className='btn btn--small' to={'/admin/courses/' + row._id}>
                                        <Fa icon={faEdit} />
                                    </Link>
                                </OverlayTrigger>
                            ),
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Title',
                            field: 'title',
                            minWidth: '55%',
                            sortKey: 'title',
                        },
                        {
                            text: 'Created at',
                            field: 'createdAt',
                            sortKey: 'createdAt',
                        },
                        {
                            text: '',
                            field: (row) => (
                                <OverlayTrigger
                                    placement='top'
                                    overlay={
                                        <Tooltip id={`tooltip-${row._id}-enrolled-students)}`}>
                                            Show enrolled students
                                        </Tooltip>
                                    }
                                >
                                    <Link className='btn btn--small' to={'/admin/courses/' + row._id + '/students'}>
                                        <Fa icon={faUserGraduate} />
                                    </Link>
                                </OverlayTrigger>
                            ),
                            maxWidth: '3.11rem',
                        },
                    ]}
                    rowButtons={[
                        {
                            type: 'button',
                            text: 'Duplicate course',
                            icon: farClone,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.duplicateCourse(doc._id, reload);
                                    },
                                    modalType: 'duplicate',
                                });
                            },
                        },
                        {
                            type: 'button',
                            text: 'Delete course',
                            icon: faTrash,
                            clickCallback: (e, doc, reload) => {
                                this.setState({
                                    modalShow: true,
                                    modalAction: () => {
                                        this.deleteCourse(doc._id, reload);
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
})(CourseTable);
