import React, { Component, ReactNode } from 'react';
import { Api } from 'src/helpers/new';
import FormBuilder from 'src/components/FormBuilder/FormBuilder';
import { Spinner } from 'src/components/Spinner';
import CourseContext from '../../CourseContext';
import { EventBus } from 'src/helpers/new';
import CourseBreadcrumb from 'src/pages/Courses/CourseBreadcrumb';
import './Enrollment.scss';

interface IRouteProps {
    match: {
        params: {
            courseId: string;
            courseStage?: 'enrollment';
        };
    };
    history: {
        push: (path: string) => void;
        replace: (path: string) => void;
    };
}

interface IProps extends IRouteProps {}

type IField = any;

type syncAsyncFunction = (() => void) | (() => Promise<void>);

interface IState {
    isLoading: boolean;
    title: string;
    fields: IField[];
    fileFields: any[];
}

export default class Enrollment extends Component<IProps, IState> {
    static contextType = CourseContext;

    state: IState = {
        isLoading: true,
        title: '',
        fields: [],
        fileFields: [],
    };

    async componentDidMount() {
        const { courseId } = this.props.match.params;
        const { success, response } = await Api.call('get', `/users/enrollment/${courseId}`);

        if (success) {
            if (response?.fields?.length > 0) {
                const fileFields = this.state.fileFields;
                response?.fields?.map((field: any) => {
                    if (field.inputType === 'file') {
                        fileFields.push(field.key);
                    }
                });
                this.setState({ isLoading: false, title: response.title, fields: response.fields, fileFields });
            } else {
                this.handleSubmit({});
            }
        }
    }

    handleProctoring(callback: syncAsyncFunction = () => {}) {
        const { proctoring = {}, proctoringSettings = {} } = this.context.course;

        if (
            proctoringSettings &&
            proctoringSettings.enrollment === 'biosig' &&
            !(proctoring.enrollment && proctoring.enrollment.success === true)
        ) {
            EventBus.dispatch('require-auth', { stage: 'enrollment', callback });
        } else {
            callback();
        }
    }

    handleSubmit = async (fields: IField): Promise<void> => {
        const { courseId } = this.props.match.params;

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

        const { success, response, error } = await Api.call('post', `/users/courses/${courseId}/enrollment`, fields);
        if (success) {
            this.handleProctoring(this.redirect);
        } else {
        }
    };

    redirect = () => {
        const { course } = this.context;
        this.props.history.replace(
            `/new/courses/${course._id}/chapters/${course.lastChapterId}/lessons/${course.lastLessonId}`
        );
    };

    public render(): ReactNode {
        const { isLoading, fields } = this.state;

        const {
            context: {
                course: { title },
            },
        } = this;

        if (isLoading) {
            return <Spinner />;
        } else {
            return (
                <FormBuilder
                    fields={fields}
                    onSubmit={this.handleSubmit}
                    header={() => <CourseBreadcrumb center firstItem={title} secondItem='Enrollment' />}
                />
            );
        }
    }
}
