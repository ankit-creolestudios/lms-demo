import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ApiTable } from '../../../components/ApiTable';

class EnrolledStudentsList extends Component {
    componentDidMount = async () => {
        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.pushBreadcrumbLink({
            text: `Enrolled Students`,
            path: `/admin/courses/${this.props.match.params.courseId}/students`,
        });
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.removeBreadcrumbLink({
            text: `Enrolled Students`,
            path: `/admin/courses/${this.props.match.params.courseId}/students`,
        });
    };

    render() {
        return (
            <ApiTable
                basePath='/admin/courses'
                apiCall={{
                    method: 'GET',
                    path: `/courses/${this.props.match.params.courseId}/enrolled`,
                }}
                columns={[
                    {
                        text: 'Full name',
                        field: (row) => `${row.firstName} ${row.lastName}`,
                        sortKey: 'firstName-lastName',
                    },
                    {
                        text: 'Enrolled #',
                        field: 'enrolledTimes',
                    },
                    {
                        text: 'Suspended #',
                        field: 'suspendedTimes',
                    },
                    {
                        text: 'Completed #',
                        field: 'completedTimes',
                    },
                ]}
            />
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
})(withRouter(EnrolledStudentsList));
