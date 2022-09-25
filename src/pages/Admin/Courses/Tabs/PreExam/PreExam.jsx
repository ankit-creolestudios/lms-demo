import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import CourseFormInputs from '../../CourseFormInputs';
import apiCall from '../../../../../helpers/apiCall';

class PreExam extends Component {
    state = {
        course: {},
    };

    componentDidMount = async () => {
        const { success, response } = await apiCall('GET', `/courses/${this.props.match.params.courseId}`);

        this.setState({
            course: response,
        });

        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.pushBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
    };

    componentWillUnmount = () => {
        this.props.removeBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.removeBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
    };

    render() {
        return <CourseFormInputs tab='PreExam' />;
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
})(withRouter(PreExam));
