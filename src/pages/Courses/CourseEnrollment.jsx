import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import apiCall from '../../helpers/apiCall';
import { FaChevronRight } from 'react-icons/fa';
import CourseBreadcrumb from './CourseBreadcrumb';
import { Spinner } from '../../components/Spinner';

class CourseEnrollment extends Component {
    state = {
        pageStatus: 'LOADING',
        fields: null,
        redirect: null,
        title: null,
    };

    async componentDidMount() {
        const {
            match,
            location: { search },
        } = this.props;

        if (search.includes('ref=NO_ENROLLMENT')) {
            this.props.setGlobalAlert({
                message: 'Complete this enrollment form to be able to start the course',
            });
        }

        const { success, response } = await apiCall('GET', `/users/enrollment/${match.params.courseId}`);

        if (success) {
            if (('required' in response && !response.required) || (response.fields && response.fields.length === 0)) {
                this.handleSubmit({});
            } else {
                this.setState({
                    title: response.title,
                    fields: response.fields,
                    pageStatus: 'READY',
                });
            }
        }
    }

    handleSubmit = async (values) => {
        const { courseId } = this.props.match.params,
            { success, message } = await apiCall('POST', `/users/courses/${courseId}/enrollment`, values);

        if (success) {
            localStorage.setItem('enrollmentCompleted', true);
            this.props.history.push(`/courses/${courseId}`);
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message ?? 'There was a problem submitting your enrollment form',
            });
        }
    };

    render() {
        const {
            state: { fields, pageStatus, title },
        } = this;

        if (pageStatus === 'READY') {
            return (
                <FormBuilder
                    fields={fields}
                    onSubmit={this.handleSubmit}
                    header={() => <CourseBreadcrumb center firstItem={title} secondItem='Enrollment' />}
                />
            );
        }

        return <Spinner />;
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(CourseEnrollment));
