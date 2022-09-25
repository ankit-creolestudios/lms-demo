import React, { Component } from 'react';
import apiCall from '../../helpers/apiCall';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import FormBuilder from '../../components/FormBuilder/FormBuilder';
import { Spinner } from '../../components/Spinner';
import CourseBreadcrumb from './CourseBreadcrumb';
import { CourseContext } from './CourseContext';
import apiFile from 'src/helpers/apiFile';
import { Api } from 'src/helpers/new';

class PreExamForm extends Component {
    static contextType = CourseContext;

    state = {
        fields: [],
        pageStatus: 'LOADING',
        fileFields: [],
    };

    async componentDidMount() {
        await this.loadPreExamFields();
    }

    loadPreExamFields = async () => {
        const { courseId } = this.props.match.params,
            { success, response, message } = await apiCall('GET', `/users/pre-exam/${courseId}/fields`),
            courseLessons = this.context.data.lessons;

        if (success) {
            if (response.status === 'IN_EXAM') {
                this.props.history.push(`/courses/${courseId}/exam`);
                return;
            }

            if (courseLessons.total !== courseLessons?.completed) {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'All course lessons must be completed before completing the pre-exam form',
                });

                this.props.history.push(`/courses/${courseId}`);
            }

            if (response.status === 'EXAM_PASSED') {
                this.props.setGlobalAlert({
                    type: 'success',
                    message: message ?? 'You have already completed this course',
                });

                this.props.history.push(`/courses/${courseId}`);
                return;
            }

            const fileFields = this.state.fileFields;
            response?.fields?.map((field) => {
                if (field.inputType === 'file') {
                    fileFields.push(field.key);
                }
            });

            this.setState({
                fields: response.fields,
                pageStatus: 'READY',
                fileFields,
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: 'Failed to load pre-exam fields: ' + message,
            });
        }
    };

    onSubmit = async (fields) => {
        if (this.state.fileFields.length > 0) {
            const uploadPromises = this.state.fileFields?.map(async (field) => {
                if (fields[field]) {
                    const fileData = new FormData();
                    fileData.append('file', fields[field]);
                    let { success, response, message } = await Api.call('POST', '/files', fileData);
                    if (success) {
                        fields[field] = response.fileId;
                    }
                }
            });
            await Promise.all(uploadPromises);
        }

        const { courseId } = this.props.match.params,
            { success, message } = await Api.call('POST', `/users/pre-exam/${courseId}`, fields);

        if (success) {
            localStorage.setItem('isEnrollmentSubmittedNow', true);
            this.props.history.replace(`/courses/${courseId}/exam`);
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: 'Failed to submit pre-exam form: ' + message,
            });
        }
    };

    render() {
        const { pageStatus } = this.state;
        if (pageStatus === 'LOADING') {
            return <Spinner />;
        }
        const {
            onSubmit,
            state: { fields },
            context: {
                data: { title },
            },
        } = this;

        return (
            <FormBuilder
                onSubmit={onSubmit}
                fields={fields}
                submitText='Start exam'
                header={() => <CourseBreadcrumb center firstItem={title} secondItem='Pre-Exam Form' />}
            />
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(PreExamForm));
