import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner } from 'src/components/Spinner';
import { Api } from 'src/helpers/new';
import ReportSettings, { TReportSettings } from './ReportSettings';

interface IProps {}

interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
}

type TProps = IConnectProps & IProps;

interface IState {
    isLoading: boolean;
    reportSettings: TReportSettings;
}

class DiscountReporting extends Component<TProps, IState> {
    state: IState = {
        isLoading: true,
        reportSettings: {
            reportTitle: 'Default Report',
            valid: 'valid',
            usage: 'unused',
            fields: [],
        },
    };

    async componentDidMount(): Promise<void> {
        this.loadData();
        this.setBreadcumbs();
        this.setButtons();
    }

    componentDidUpdate(prevProps: TProps, prevState: IState) {
        if (prevState.isLoading !== this.state.isLoading) {
            this.setButtons();
        }
    }

    componentWillUnmount() {
        this.props.createFormActions({
            customButtons: [],
        });
        this.props.removeBreadcrumbLink({
            text: 'Reports',
            path: '/admin/discounts/reports',
        });
    }

    loadData = async () => {
        this.setState({ isLoading: false });
    };

    setBreadcumbs = (): void => {
        this.props.pushBreadcrumbLink({
            text: 'Reports',
            path: '/admin/discounts/reports',
        });
    };

    setButtons = (): void => {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Generate Report',
                    onClick: this.generateReport,
                    className: 'bp',
                    disabled: this.state.isLoading,
                },
            ],
        });
    };

    generateReport = async () => {
        this.setState({ isLoading: true });
        const { success, response, message } = await Api.call(
            'post',
            'discounts/reports/generate',
            this.state.reportSettings
        );
        if (success) {
            window.open(response.url, '_blank');
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
        this.setState({ isLoading: false });
    };

    handleChange = (reportSettings: TReportSettings): void => {
        this.setState({ reportSettings });
    };

    render() {
        if (this.state.isLoading) return <Spinner />;
        const { reportSettings } = this.state;

        return <ReportSettings reportSettings={reportSettings} onChange={this.handleChange} />;
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
})(DiscountReporting);
