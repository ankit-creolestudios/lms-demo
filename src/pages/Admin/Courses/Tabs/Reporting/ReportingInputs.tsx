import React, { Component } from 'react';
import apiCall from '../../../../../helpers/apiCall';
import { Form, Col, Row, FormGroup } from 'react-bootstrap';
import { ReportingFields, IField } from './ReportingFields';
import DatePicker from '../../../../../components/DatePicker/DatePicker';
import { ConfirmationModal } from '../../../../../components/ConfirmationModal';
import Toggle from '../../../../../components/FormItems/Toggle';
import './ReportingInputs.scss';

interface IState {
    showModal: boolean;
    modalAction: (param: any) => void | Promise<void>;
    modalBodyText: string;
}

interface IProps {
    update: (reportingData: IReportingData) => void;
    addNewTemplate?: (templateId: string) => void;
    reportingData: IReportingData;
    availableTemplates?: ITemplate[];
    availableDataTargets: IDataTarget[];
    type: 'course' | 'template';
}

export interface IReportingData {
    _id: string;
    title: string;
    start: Date;
    end: Date;
    format: TFormat;
    target: TTarget;
    template?: string;
    noHeader?: boolean;
    fields: IField[];
    pdfData?: {
        fields: IField[];
    };
}

type TFormat = 'excel' | 'csv' | 'txt' | 'pdf';
type TTarget = 'passed' | 'failed' | 'all';
export interface ITemplate {
    _id: string;
    title: string;
}

export interface IDataTarget {
    label: string;
    path: string;
    type: 'string' | 'number' | 'date';
}

export default class ReportingInputs extends Component<IProps, IState> {
    state = {
        showModal: false,
        modalAction: () => {},
        modalBodyText: '',
    };

    handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const reportingData = Object.assign(this.props.reportingData);
        reportingData[e.target.name] = e.target.value;

        this.update(reportingData);
    };

    handleNoHeaderChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const reportingData = {
            ...this.props.reportingData,
            noHeader: e.target.name === 'noHeader',
        };
        this.update(reportingData);
    };

    handleDateChange = (name: 'start' | 'end', date: Date): void => {
        const reportingData = {
            ...this.props.reportingData,
            [name]: date,
        };
        this.update(reportingData);
    };

    handleFieldChange = (fields: IField[]): void => {
        const reportingData = Object.assign(this.props.reportingData);
        reportingData.fields = fields;

        this.update(reportingData);
    };

    handlePdfDataFieldChange = (fields: IField[]) => {
        const reportingData = Object.assign(this.props.reportingData);
        reportingData.pdfFields = { fields };

        this.update(reportingData);
    };

    update = (reportingData: IReportingData) => {
        this.props.update(reportingData);
    };

    confirmLoadTemplate = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();
        const template = this.props.reportingData.template;
        if (template === 'none' || template === undefined || template === null) {
            return;
        }
        const { success, response } = await apiCall('get', `/reporting/templates/${template}`);
        if (success) {
            this.setState({
                showModal: true,
                modalAction: () => this.loadTemplate(response),
                modalBodyText: `Are you sure you want to load ${
                    response.title ?? 'this template'
                }? it will overwrite any changes`,
            });
        }
    };

    loadTemplate = (template: IReportingData) => {
        this.update({ ...template, template: this.props.reportingData.template, _id: this.props.reportingData._id });
        this.setState({ showModal: false, modalAction: () => {}, modalBodyText: '' });
    };

    confirmSaveTemplate = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();
        const template = this.props.reportingData.template;
        if (template === 'none' || template === undefined || template === null) {
            return;
        }
        const { success, response } = await apiCall('get', `/reporting/templates/${template}`);
        if (success) {
            this.setState({
                showModal: true,
                modalAction: () => this.saveTemplate(template),
                modalBodyText: `Are you sure you want to overwrite ${
                    response.title ?? 'this template'
                } with the current settings?`,
            });
        }
    };

    saveTemplate = async (templateId: string): Promise<void> => {
        const { success, response } = await apiCall(
            'patch',
            `/reporting/templates/${templateId}`,
            this.props.reportingData
        );
        this.setState({ showModal: false, modalAction: () => {}, modalBodyText: '' });
    };

    confirmSaveAsTemplate = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            showModal: true,
            modalAction: () => this.saveAsTemplate(),
            modalBodyText: `Are you sure you want to save ${this.props.reportingData.title} as a new template?`,
        });
    };

    saveAsTemplate = async (): Promise<void> => {
        const { success, response } = await apiCall('post', `/reporting/templates`, {
            templateData: this.props.reportingData,
        });
        if (success) {
            this.props?.addNewTemplate?.(response._id);
            this.setState({ showModal: false, modalAction: () => {}, modalBodyText: '' });
        }
    };

    render(): React.ReactNode {
        const { reportingData } = this.props;

        return (
            <div className='reporting-inputs'>
                <Form id='courseForm'>
                    <Row className='pt-4'>
                        <Col lg={3}>
                            <FormGroup>
                                <Form.Label htmlFor='title'>Title</Form.Label>
                                <Form.Control
                                    type='text'
                                    required
                                    minLength={3}
                                    maxLength={512}
                                    id='title'
                                    name='title'
                                    value={reportingData.title}
                                    onChange={this.handleChange}
                                />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row className='pt-2'>
                        <Col lg={2}>
                            <DatePicker
                                raw
                                id='start'
                                handleDateChange={this.handleDateChange}
                                date={reportingData.start}
                                label='Start Date'
                            />
                        </Col>
                        <Col lg={2}>
                            <DatePicker
                                raw
                                id='end'
                                handleDateChange={this.handleDateChange}
                                date={reportingData.end}
                                label='End Date'
                            />
                        </Col>
                    </Row>
                    <Row className='pt-2'>
                        <Col lg={2}>
                            <FormGroup>
                                <Form.Label htmlFor='title'>Format</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='format'
                                    name='format'
                                    value={reportingData.format}
                                    onChange={this.handleChange}
                                >
                                    <option value='excel'>Excel</option>
                                    <option value='csv'>CSV</option>
                                    <option value='txt'>TXT</option>
                                    <option value='pdf'>PDF</option>
                                </Form.Control>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup>
                                <Form.Label htmlFor='title'>Target</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='target'
                                    name='target'
                                    value={reportingData.target}
                                    onChange={this.handleChange}
                                >
                                    <option value='passed'>Passed</option>
                                    <option value='failed'>Failed</option>
                                    <option value='all'>All students</option>
                                </Form.Control>
                            </FormGroup>
                        </Col>
                    </Row>
                    {this.props.type === 'course' && this.props.availableTemplates && reportingData.format !== 'pdf' && (
                        <>
                            <Row className='pt-2'>
                                <Col lg={2}>
                                    <FormGroup>
                                        <Form.Label htmlFor='title'>Template</Form.Label>
                                        <Form.Control
                                            as='select'
                                            id='template'
                                            name='template'
                                            value={reportingData.template}
                                            onChange={this.handleChange}
                                        >
                                            <option key='none' value='none'>
                                                No Template
                                            </option>
                                            {this.props.availableTemplates.map((template) => {
                                                return (
                                                    <option key={template._id} value={template._id}>
                                                        {template.title}
                                                    </option>
                                                );
                                            })}
                                        </Form.Control>
                                    </FormGroup>
                                </Col>
                                <Col lg={2}>
                                    <Form.Label htmlFor='title'>Header</Form.Label>
                                    <FormGroup>
                                        <Row className='pt-2 header-toggle'>
                                            <Toggle
                                                type='radio'
                                                name='header'
                                                id='header'
                                                checked={!reportingData.noHeader}
                                                onChange={this.handleNoHeaderChange}
                                            />
                                            <label htmlFor='header'>Header</label>
                                            <Toggle
                                                type='radio'
                                                name='noHeader'
                                                id='noHeader'
                                                checked={!!reportingData.noHeader}
                                                onChange={this.handleNoHeaderChange}
                                            />
                                            <label htmlFor='noHeader'>No Header</label>
                                        </Row>
                                    </FormGroup>
                                </Col>
                            </Row>
                            <Row className='pt-2 buttons'>
                                <button onClick={this.confirmLoadTemplate} className='btn bp btn--small'>
                                    Load Template
                                </button>
                                <button onClick={this.confirmSaveTemplate} className='btn bp btn--small'>
                                    Save Template
                                </button>
                                <button onClick={this.confirmSaveAsTemplate} className='btn bp btn--small'>
                                    Save as Template
                                </button>
                            </Row>
                        </>
                    )}
                    <Row className='pt-4'>
                        <ReportingFields
                            onChange={
                                reportingData.format === 'pdf' ? this.handlePdfDataFieldChange : this.handleFieldChange
                            }
                            fields={
                                reportingData.format === 'pdf'
                                    ? reportingData?.pdfData?.fields ?? []
                                    : reportingData.fields
                            }
                            availableDataTargets={this.props.availableDataTargets}
                            isPdf={reportingData.format === 'pdf'}
                        />
                    </Row>
                </Form>
                <ConfirmationModal
                    show={this.state.showModal}
                    hideModal={() => {
                        this.setState({
                            showModal: false,
                        });
                    }}
                    confirmAction={this.state.modalAction}
                    titleText={'Are you sure?'}
                    bodyText={this.state.modalBodyText}
                />
            </div>
        );
    }
}
