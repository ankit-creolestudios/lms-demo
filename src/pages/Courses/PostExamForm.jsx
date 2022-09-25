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

class PostExamFrom extends Component {
    static contextType = CourseContext;

    state = {
        courseTitle: '',
        fields: [],
        pageStatus: 'LOADING',
        fileFields: [],
    };

    async componentDidMount() {
        if (!this.context.data.preExamUpdatedAt && !localStorage.getItem('isEnrollmentSubmittedNow')) {
            this.props.history.push(`/courses/${this.props.match.params.courseId}/preexam`);

            return;
        }
        await this.loadPreExamFields();
    }

    loadPreExamFields = async () => {
        const { courseId } = this.props.match.params,
            { success, response, message } = await apiCall('GET', `/users/post-exam/${courseId}/fields`);

        if (success) {
            if (response.status === 'IN_EXAM') {
                this.props.history.push(`/courses/${courseId}/exam`);
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
        const { courseId } = this.props.match.params;
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

        const { success, message } = await Api.call('POST', `/users/post-exam/${courseId}`, fields);

        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Course completed',
            });
            localStorage.setItem('postExamCompleted', true);
            this.props.history.push(`/courses/${courseId}`);
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: 'Failed to submit post-exam form: ' + message,
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
                header={() => <CourseBreadcrumb center firstItem={title} secondItem='Post-Exam Form' />}
            />
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(PostExamFrom));
