import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import FormBuilder from 'src/components/FormBuilder/FormBuilder';
import { Spinner } from 'src/components/Spinner';
import CourseContext from 'src/pages/Course/CourseContext';
import CourseBreadcrumb from 'src/pages/Courses/CourseBreadcrumb';

interface IState {
    fields: any;
    pageStatus: string;
    fileFields: any;
}
interface IRouteProps {
    courseId: string;
}
interface IProps {}
type TProps = IProps & RouteComponentProps<IRouteProps>;

export default class PreExamForm extends Component<TProps, IState> {
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
            {
                course: { preExamUpdatedAt, postExamUpdatedAt },
            } = this.context,
            { success, response, message } = await Api.call('GET', `/users/pre-exam/${courseId}/fields`);
        if (success) {
            if (response.status === 'IN_EXAM' || preExamUpdatedAt) {
                this.props.history.push(`/new/courses/${courseId}/exam`);
                return;
            } else if (response.status === 'EXAM_PASSED' || postExamUpdatedAt) {
                this.props.history.push(`/new/courses/${courseId}`);
                return;
            }
            const fileFields = this.state.fileFields;
            response?.fields?.map((field: any) => {});
            this.setState({
                fields: response.fields,
                pageStatus: 'READY',
                fileFields,
            });
        } else {
        }
    };

    onSubmit = async (fields: any) => {
        if (this.state.fileFields.length > 0) {
            const uploadPromises = this.state.fileFields?.map(async (field) => {
                if (fields[field]) {
                    const fileData = new FormData();
                    fileData.append('file', fields[field]);
                    const { success, response, message } = await Api.call('POST', '/files', fileData);
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
            this.props.history.replace(`/new/courses/${courseId}/exam`);
        } else {
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
                course: { title },
            },
        } = this;

        return (
            <FormBuilder
                onSubmit={onSubmit}
                fields={fields}
                submitText='Start exam'
                header={() => <CourseBreadcrumb center firstItem={title} secondItem='Pre Exam Form' />}
            />
        );
    }
}
