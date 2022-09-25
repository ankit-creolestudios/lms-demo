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
    courseTitle: '';
}
interface IRouteProps {
    courseId: string;
}
interface IProps {}
type TProps = IProps & RouteComponentProps<IRouteProps>;

export default class PostExamFrom extends Component<TProps, IState> {
    static contextType = CourseContext;

    state: IState = {
        courseTitle: '',
        fields: [],
        pageStatus: 'LOADING',
        fileFields: [],
    };

    async componentDidMount() {
        await this.loadPostExamFields();
    }

    loadPostExamFields = async () => {
        const { courseId } = this.props.match.params,
            { success, response } = await Api.call('GET', `/users/post-exam/${courseId}/fields`);

        if (success) {
            if (response.status === 'IN_EXAM') {
                this.props.history.push(`/new/courses/${courseId}/exam`);
                return;
            }
            const fileFields = this.state.fileFields;
            response?.fields?.map((field: any) => {
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
        }
    };

    onSubmit = async (fields: any) => {
        const { courseId } = this.props.match.params;
        if (this.state.fileFields.length > 0) {
            const uploadPromises = this.state.fileFields?.map(async (field: any) => {
                if (fields[field]) {
                    const fileData = new FormData();
                    fileData.append('file', fields[field]);
                    const { success, response } = await Api.call('POST', '/files', fileData);
                    if (success) {
                        fields[field] = response.fileId;
                    }
                }
            });
            await Promise.all(uploadPromises);
        }

        const { success } = await Api.call('POST', `/users/post-exam/${courseId}`, fields);

        if (success) {
            localStorage.setItem('postExamCompleted', 'true');
            this.props.history.push(`/`);
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
                header={() => <CourseBreadcrumb center firstItem={title} secondItem='Post-Exam Form' />}
            />
        );
    }
}
