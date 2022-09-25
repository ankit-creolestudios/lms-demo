import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import apiCall from '../../../../../helpers/apiCall';
import ReportingInputs, { IReportingData, ITemplate, IDataTarget } from './ReportingInputs';
import { IField } from './ReportingFields';
import { Spinner } from '../../../../../components/Spinner';

interface IRouteProps {
    courseId: string;
}

interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
}

interface IState {
    isLoading: boolean;
    isEdited: boolean;
    reportingData: IReportingData;
    availableTemplates: ITemplate[];
    availableDataTargets: IDataTarget[];
    course: any;
}

class Reporting extends Component<IConnectProps & RouteComponentProps<IRouteProps>, IState> {
    state: IState = {
        isLoading: true,
        isEdited: false,
        reportingData: {
            _id: '',
            title: '',
            start: new Date(Date.now()),
            end: new Date(Date.now()),
            format: 'excel',
            target: 'passed',
            fields: [],
            pdfData: {
                fields: [],
            },
        },
        availableTemplates: [],
        availableDataTargets: [],
        course: {},
    };

    async componentDidMount(): Promise<void> {
        await this.fetchCourseData();
        this.setBreadcumbs();
        this.fetchReportSettings();
        this.fetchavAilableTemplates();
        this.fetchavAilableDataTargets();
        this.setButtons();
    }

    componentDidUpdate(prevProps: unknown, prevState: IState): void {
        if (prevState.isEdited !== this.state.isEdited) {
            this.setButtons();
        }
    }

    componentWillUnmount() {
        this.props.createFormActions({
            customButtons: [],
        });
    }

    fetchCourseData = async (): Promise<void> => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        const { response } = await apiCall('GET', `/courses/${this.props.match.params.courseId}`);
        this.setState({
            course: response,
        });
    };

    setBreadcumbs = (): void => {
        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
        this.props.pushBreadcrumbLink({
            text: `Course: ${this.state.course.title}`,
            path: `/admin/courses/${this.props.match.params.courseId}`,
        });
    };

    fetchReportSettings = async (): Promise<void> => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        const { success, response, message } = await apiCall(
            'get',
            `/courses/reportsettings/${this.props.match.params.courseId}`
        );
        if (success) {
            response.target = response.target ?? 'passed';
            this.setState({ reportingData: response, isLoading: false });
        } else {
            await this.createReportSettings();
            this.fetchReportSettings();
        }
    };

    createReportSettings = async (): Promise<void> => {
        await apiCall('post', `/courses/reportsettings/${this.props.match.params.courseId}`);
        return;
    };

    setButtons = (): void => {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Generate Report',
                    onClick: this.generateReport,
                    className: 'bp',
                    disabled: this.state.isEdited,
                },
                // {
                //     label: 'View Reports',
                //     onClick: this.viewReports,
                //     className: 'bp',
                //     disabled: true,
                // },
                {
                    label: 'Save',
                    onClick: this.handleSubmit,
                    className: 'bp',
                    disabled: !this.state.isEdited,
                },
            ],
        });
    };

    generateReport = async () => {
        this.setState({ isLoading: true });
        const { success, response, message } = await apiCall(
            'post',
            `/courses/reportsettings/${this.state.reportingData._id}/generate`
        );
        if (success) {
            window.open(response.url, '_blank');
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
        this.setState({ isLoading: false });
    };

    viewReports = () => {
        console.log('View reports');
    };

    handleSubmit = (e: React.FormEvent): void => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.save();
    };

    save = async (): Promise<void> => {
        this.setState({ isLoading: true });
        const { success, message } = await apiCall(
            'patch',
            `/courses/reportsettings/${this.state.reportingData._id}`,
            this.submitData
        );
        if (success) {
            this.props.setGlobalAlert({
                type: 'success',
                message: message ?? 'Saved successfully',
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message,
            });
        }
        this.setState({ isLoading: false, isEdited: false });
    };

    get submitData() {
        const reportingData = Object.assign({}, this.state.reportingData);
        reportingData.fields = reportingData.fields.map((field: IField) => {
            const sumbittedField: any = Object.assign({}, field);
            delete sumbittedField.control;
            return sumbittedField;
        });
        return reportingData;
    }

    fetchavAilableTemplates = async (): Promise<void> => {
        const { success, response } = await apiCall('GET', `/reporting/templates`);
        if (success && response.docs.length > 0) {
            this.setState({
                availableTemplates: response.docs,
                reportingData: { template: response.docs[0]._id, ...this.state.reportingData },
            });
        } else {
            this.setState({ availableTemplates: [] });
        }
    };

    fetchavAilableDataTargets = async (): Promise<void> => {
        const { success, response } = await apiCall('GET', `/courses/reportsettings/targets`);
        if (success) {
            this.setState({ availableDataTargets: response });
        }
    };

    handleUpdate = (reportingData: IReportingData) => {
        this.setState({ reportingData, isEdited: true });
    };

    handleNewTemplate = (templateId: string) => {
        this.setState({ reportingData: { ...this.state.reportingData, template: templateId }, isEdited: true });
        this.fetchavAilableTemplates();
    };

    render(): React.ReactNode {
        if (this.state.isLoading) {
            return <Spinner />;
        } else {
            return (
                <ReportingInputs
                    update={this.handleUpdate}
                    addNewTemplate={this.handleNewTemplate}
                    reportingData={this.state.reportingData}
                    availableTemplates={this.state.availableTemplates}
                    availableDataTargets={this.state.availableDataTargets}
                    type='course'
                />
            );
        }
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setGlobalAlert: (payload: any) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
    createFormActions: (payload: any) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(withRouter(Reporting));
