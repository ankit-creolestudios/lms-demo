import React, { Component } from 'react';
import ReportingInputs, { IReportingData, IDataTarget } from '../../../Courses/Tabs/Reporting/ReportingInputs';
import { IField } from '../../../Courses/Tabs/Reporting/ReportingFields';
import { Spinner } from '../../../../../components/Spinner';
import apiCall from '../../../../../helpers/apiCall';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';

interface IRouteProps {
    templateId: string;
}

interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
}

type TProps = IConnectProps & RouteComponentProps<IRouteProps>;

interface IState {
    isLoading: boolean;
    isEdited: boolean;
    templateData: IReportingData;
    availableDataTargets: IDataTarget[];
}

class Template extends Component<TProps, IState> {
    state: IState = {
        isLoading: true,
        isEdited: false,
        templateData: {
            _id: '',
            title: '',
            start: new Date(Date.now()),
            end: new Date(Date.now()),
            format: 'excel',
            target: 'passed',
            fields: [],
        },
        availableDataTargets: [],
    };

    async componentDidMount(): Promise<void> {
        await this.fetchTemplateData();
        this.fetchavAilableDataTargets();
        this.setBreadcumbs();
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

    fetchTemplateData = async (): Promise<void> => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        const { success, response } = await apiCall(
            'get',
            `/reporting/templates/${this.props.match.params.templateId}`
        );
        if (success) {
            response.target = response.target ?? 'passed';
            this.setState({ templateData: response, isLoading: false });
        }
    };

    fetchavAilableDataTargets = async (): Promise<void> => {
        const { success, response } = await apiCall('GET', `/courses/reportsettings/targets`);
        if (success) {
            this.setState({ availableDataTargets: response });
        }
    };

    setButtons = (): void => {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Save',
                    onClick: this.handleSubmit,
                    className: 'bp',
                    disabled: !this.state.isEdited,
                },
            ],
        });
    };

    setBreadcumbs = (): void => {
        this.props.pushBreadcrumbLink({
            text: `Course: ${this.state.templateData.title}`,
            path: `/admin/reporting/templates/${this.props.match.params.templateId}`,
        });
    };

    handleSubmit = async (): Promise<void> => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        const { success, message } = await apiCall(
            'patch',
            `/reporting/templates/${this.props.match.params.templateId}`,
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
        const templateData = Object.assign({}, this.state.templateData);
        templateData.fields = templateData.fields.map((field: IField) => {
            const sumbittedField: any = Object.assign({}, field);
            delete sumbittedField.control;
            return sumbittedField;
        });
        return templateData;
    }

    handleUpdate = (templateData: IReportingData) => {
        this.setState({ templateData, isEdited: true });
    };

    public render() {
        if (this.state.isLoading) {
            return <Spinner />;
        } else {
            return (
                <div className='tab-content'>
                    <ReportingInputs
                        update={this.handleUpdate}
                        availableDataTargets={this.state.availableDataTargets}
                        reportingData={this.state.templateData}
                        type='template'
                    />
                </div>
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
})(withRouter(Template));
