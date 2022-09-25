import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import DatePicker from 'src/components/DatePicker/DatePicker';
import apiCall from 'src/helpers/apiCall';
import { IParams as IDiscountParams } from 'src/pages/Admin/Discounts/DiscountsGroupForm/DiscountsGroupForm';

interface IParams extends IDiscountParams {
    codeId: string;
}

type IProps = RouteComponentProps<IParams> & {
    setGlobalAlert: any;
    createFormActions: any;
    pushBreadcrumbLink: any;
    removeBreadcrumbLink: any;
};
class CodeForm extends Component<IProps> {
    state = {
        groupPackages: [],
        packageIds: [],
        discountType: 'PERCENTAGE',
        commissionType: 'PERCENTAGE',
        discountValue: 0,
        commissionValue: 0,
        validAt: '',
        invalidAt: '',
        useLimit: 0,
        generationGroupId: null,
        code: '',
        count: 1,
        description: '',
    };

    query!: URLSearchParams;

    get discountGroupId() {
        return this.props.match.params.discountGroupId;
    }

    get codeId() {
        return this.props.match.params.codeId;
    }

    get isNew() {
        return this.codeId === 'new';
    }

    async componentDidMount() {
        this.query = new URLSearchParams(this.props.location.search);

        await this.loadDiscountGroupBreadcrumb();

        await this.loadDiscountGroupPackages();

        if (this.isNew) {
            this.props.pushBreadcrumbLink({
                text: 'New code',
                path: `/admin/discounts/${this.discountGroupId}/codes/new`,
            });

            this.checkForPreselectedPackagesInQuery();
        } else {
            await this.loadCodeData();
        }

        this.setButtons();
    }

    async componentDidUpdate(prevProps: IProps, prevState: any) {
        if (prevProps.match.params.discountGroupId !== this.props.match.params.discountGroupId) {
            this.props.removeBreadcrumbLink({
                text: '',
                path: `/admin/discounts/${prevProps.match.params.discountGroupId}`,
            });

            await this.loadDiscountGroupBreadcrumb();
            await this.loadDiscountGroupPackages();
        }

        if (prevProps.match.params.codeId !== this.codeId && !this.isNew) {
            this.props.removeBreadcrumbLink({
                text: '',
                path: `/admin/discounts/${prevProps.match.params.discountGroupId}/codes/${prevProps.match.params.codeId}`,
            });

            await this.loadCodeData();
        }

        if (this.props.location.search !== prevProps.location.search) {
            this.query = new URLSearchParams(this.props.location.search);
        }
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: '',
            path: `/admin/discounts/${this.discountGroupId}`,
        });

        this.props.removeBreadcrumbLink({
            text: '',
            path: `/admin/discounts/${this.discountGroupId}/codes/${this.codeId}`,
        });

        this.props.createFormActions({
            customButtons: [],
        });
    }

    async loadCodeData() {
        const { success, response, message } = await apiCall('GET', `/discounts/codes/${this.codeId}`);

        if (success) {
            this.props.pushBreadcrumbLink({
                text: response.code,
                path: `/admin/discounts/${this.discountGroupId}/codes/${this.codeId}`,
            });

            this.setState(response);
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    }

    async setButtons() {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Save',
                    onClick: this.handleSave,
                    className: 'bp',
                },
            ],
        });
    }

    handleSave = async () => {
        const { groupPackages, generationGroupId, ...body } = this.state;
        const { success, response, message } = await apiCall(
            this.isNew ? 'POST' : 'PUT',
            '/discounts/codes' + (!this.isNew ? `/${this.codeId}` : ''),
            {
                ...body,
                discountGroupId: this.discountGroupId,
            }
        );

        if (success) {
            if (body.code) {
                this.props.history.push(`/admin/discounts/${this.discountGroupId}/codes/${response._id}`);
            } else {
                this.props.history.push(`/admin/discounts/${this.discountGroupId}?tab=codes`);
            }

            this.props.setGlobalAlert({ type: 'success', message });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    loadDiscountGroupBreadcrumb = async () => {
        const { success, response } = await apiCall('GET', `/discounts/groups/${this.discountGroupId}`);

        if (success) {
            this.props.pushBreadcrumbLink({
                text: response.name,
                path: `/admin/discounts/${response._id}`,
            });

            if (this.isNew) {
                this.setState({
                    discountValue: response.defaultDiscountValue ?? 0,
                    commissionValue: response.defaultCommissionValue ?? 0,
                    discountType: response.defaultDiscountType ?? 'PERCENTAGE',
                    commissionType: response.defaultCommissionType ?? 'PERCENTAGE',
                });
            }
        }
    };

    checkForPreselectedPackagesInQuery = () => {
        const packages = this.query.get('packages');

        if (packages) {
            this.setState({
                packageIds: packages.split(',') ?? [],
            });
        }
    };

    loadDiscountGroupPackages = async () => {
        const { discountGroupId } = this.props.match.params;
        const { success, response, message } = await apiCall(
            'GET',
            `/discounts/groups/${discountGroupId}/packages?perPage=999&isEnabled=1`
        );

        if (success) {
            this.setState({
                groupPackages: response.docs,
            });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let value: string | number | string[] = e.target.value;

        if (e.target.type === 'number') {
            value = parseInt(value);
        }

        if (e.target.type === 'select-multiple') {
            value = [...(e.target as EventTarget & HTMLSelectElement).selectedOptions].map((option) => option.value);
        }

        this.setState({
            [e.target.name]: value,
        });
    };

    render() {
        const {
            packageIds,
            groupPackages,
            discountType,
            commissionType,
            discountValue,
            commissionValue,
            validAt,
            invalidAt,
            useLimit,
            count,
            code,
            generationGroupId,
            description,
        } = this.state;

        return (
            <div className='form form--two-cols'>
                <div className='form__content pt-4 pb-1'>
                    <form>
                        <Row>
                            <div className='form__field'>
                                <label htmlFor='packageIds'>Packages</label>
                                <select name='packageIds' value={packageIds} onChange={this.handleInputChange} multiple>
                                    {groupPackages.map((groupPackage: any) => (
                                        <option key={groupPackage._id} value={groupPackage._id}>
                                            {groupPackage.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </Row>
                        <Row>
                            <Col>
                                <div className='form__field'>
                                    <label htmlFor='generationGroupId'>Generation ID</label>
                                    <input
                                        type='text'
                                        name='generationGroupId'
                                        value={generationGroupId ?? 'Generated upon submission'}
                                        disabled
                                    />
                                    <small>
                                        <br />
                                    </small>
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='code'>Fixed code</label>
                                    <input
                                        type='text'
                                        name='code'
                                        value={code}
                                        pattern='[0-9A-Z]+'
                                        onChange={this.handleInputChange}
                                    />
                                    {this.isNew && (
                                        <small>
                                            Creates a single code with the input text. Leave blank to generate random
                                            unique codes.
                                        </small>
                                    )}
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='discountType'>Discount type</label>
                                    <select name='discountType' value={discountType} onChange={this.handleInputChange}>
                                        <option value='PERCENTAGE'>Percentage</option>
                                        <option value='FIXED'>Fixed</option>
                                    </select>
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='discountValue'>Discount value</label>
                                    <input
                                        type='number'
                                        name='discountValue'
                                        value={discountValue}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='validAt'>Valid from</label>
                                    <DatePicker
                                        name='validAt'
                                        onChange={this.handleInputChange}
                                        date={validAt}
                                        yearRange='upper'
                                        showClearDate
                                    />
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='description'>Description</label>
                                    <textarea
                                        name='description'
                                        value={description}
                                        rows={2}
                                        onChange={this.handleInputChange}
                                        style={{ resize: 'none' }}
                                    />
                                </div>
                            </Col>
                            <Col>
                                <div className='form__field'>
                                    <label htmlFor='useLimit'>Use limit</label>
                                    <input
                                        type='number'
                                        name='useLimit'
                                        value={useLimit}
                                        onChange={this.handleInputChange}
                                    />
                                    <small>Enter 0 for unlimited uses.</small>
                                </div>
                                {this.isNew && (
                                    <div className='form__field'>
                                        <label htmlFor='count'>Generation count (max. 5000)</label>
                                        <input
                                            type='number'
                                            name='count'
                                            min={1}
                                            max={5000}
                                            value={count}
                                            onChange={this.handleInputChange}
                                        />
                                        <small>
                                            Use this to generate multiple random unique codes. This is ignored if the
                                            &quot;Fixed code&quot; field is filled.
                                        </small>
                                    </div>
                                )}
                                <div className='form__field'>
                                    <label htmlFor='commissionType'>Commission type</label>
                                    <select
                                        name='commissionType'
                                        value={commissionType}
                                        onChange={this.handleInputChange}
                                    >
                                        <option value='PERCENTAGE'>Percentage</option>
                                        <option value='FIXED'>Fixed</option>
                                    </select>
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='commissionValue'>Commission value</label>
                                    <input
                                        type='number'
                                        name='commissionValue'
                                        value={commissionValue}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <div className='form__field'>
                                    <label htmlFor='invalidAt'>Invalid from</label>
                                    <DatePicker
                                        name='invalidAt'
                                        onChange={this.handleInputChange}
                                        date={invalidAt}
                                        yearRange='upper'
                                        showClearDate
                                    />
                                </div>
                            </Col>
                        </Row>
                    </form>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload: any) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
    createFormActions: (payload: any) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(CodeForm));
