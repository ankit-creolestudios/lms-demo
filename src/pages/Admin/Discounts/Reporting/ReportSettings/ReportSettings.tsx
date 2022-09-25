import React, { Component } from 'react';
import Filters, { IFilters } from './Filters';
import Fields, { IField } from './Fields';

interface IProps {
    reportSettings: TReportSettings;
    onChange: (ReportSettings: TReportSettings) => void;
}

export type TReportSettings = IFilters & IFields;

interface IFields {
    fields: IField[];
}

export default class ReportSettings extends Component<IProps> {
    get filters(): IFilters {
        const { fields, ...filters } = this.props.reportSettings;
        return filters;
    }

    get fields(): IField[] {
        return this.props.reportSettings.fields;
    }

    handleFiltersChange = (filters: IFilters): void => {
        this.props.onChange({ ...this.props.reportSettings, ...filters });
    };

    handleFieldsChange = (fields: IField[]): void => {
        this.props.onChange({ ...this.props.reportSettings, fields });
    };

    render() {
        return (
            <div className='report-settings'>
                <Filters filters={this.filters} onChange={this.handleFiltersChange} />
                <Fields fields={this.fields} onChange={this.handleFieldsChange} />
            </div>
        );
    }
}
