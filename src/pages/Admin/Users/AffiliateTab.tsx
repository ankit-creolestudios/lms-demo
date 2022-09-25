import React, { Component } from 'react';
import { Col, Row } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ApiTable } from 'src/components/ApiTable';
import apiCall from 'src/helpers/apiCall';

class AffiliateTab extends Component<any, any> {
    constructor(props: any) {
        super(props);

        this.state = {
            discountGroupId: '',
            discountGroups: [],
            isAllowedToGetCommissions: true,
        };
    }

    async componentDidMount() {
        await this.setSelectedGroup();
        await this.loadDiscountGroups();

        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Save',
                    onClick: this.onClickSave,
                    className: 'bp',
                },
            ],
        });
    }

    async componentDidUpdate(prevProps: any) {
        if (prevProps.user._id !== this.props.user._id) {
            await this.setSelectedGroup();
        }
    }

    componentWillUnmount() {
        this.props.createFormActions({
            customButtons: [],
        });
    }

    setSelectedGroup = async () => {
        if (this.props.user.discountGroupId) {
            this.setState({
                discountGroupId: this.props.user.discountGroupId,
                isAllowedToGetCommissions: this.props.user.isAllowedToGetCommissions ?? true,
            });

            return;
        }

        const { success, response } = await apiCall('GET', '/settings/values/defaultDiscountGroupId');

        if (success) {
            this.setState({
                discountGroupId: response.defaultDiscountGroupId ?? null,
            });
        }
    };

    loadDiscountGroups = async () => {
        const { success, response } = await apiCall('GET', '/discounts/groups?perPage=999');

        if (success) {
            this.setState({
                discountGroups: response.docs,
            });
        }
    };

    onChangeDiscountGroupId = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            discountGroupId: e.target.value,
        });
    };

    onChangeIsAllowedToGetCommissions = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            isAllowedToGetCommissions: e.target.checked,
        });
    };

    onClickSave = async () => {
        const { success, message } = await apiCall('PUT', `/users/${this.props.user._id}`, {
            discountGroupId: this.state.discountGroupId,
            isAllowedToGetCommissions: this.state.isAllowedToGetCommissions,
        });

        if (success) {
            this.props.setGlobalAlert({ type: 'success', message: message ?? 'User affiliate settings saved' });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    };

    render() {
        const { discountGroups, discountGroupId, isAllowedToGetCommissions } = this.state;

        return (
            <div className='pt-3'>
                <Row>
                    <Col>
                        <div>
                            <label htmlFor='discountGroupId'>
                                <b>Discount group</b>
                            </label>
                            <select
                                name='discountGroupId'
                                value={discountGroupId}
                                onChange={this.onChangeDiscountGroupId}
                            >
                                {discountGroups.map(({ _id, name }: any) => (
                                    <option key={_id} value={_id}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Col>
                    <Col>
                        <label htmlFor='isAllowedToGetCommissions'>
                            <b>Allow user to receive commissions?&nbsp;</b>
                        </label>
                        <br />
                        <input
                            type='checkbox'
                            name='isAllowedToGetCommissions'
                            className='mt-2'
                            checked={isAllowedToGetCommissions}
                            onChange={this.onChangeIsAllowedToGetCommissions}
                        />
                    </Col>
                </Row>
                <ApiTable
                    apiCall={{ method: 'GET', path: `/users/affiliates/${this.props.match.params.id}/commissions` }}
                    columns={[
                        {
                            text: 'Order ID',
                            field: 'orderId',
                            maxWidth: '235px',
                        },
                        {
                            text: 'Code',
                            field: 'code',
                            maxWidth: '235px',
                        },
                        {
                            text: 'Package',
                            field: ({ packageTitle }: { packageTitle: string }) => (
                                <span className='oneline-text' title={packageTitle}>
                                    {packageTitle}
                                </span>
                            ),
                            maxWidth: '450px',
                        },
                        {
                            text: 'Commission value',
                            field: ({ finalCommission }: { finalCommission: number }) =>
                                global.USCurrency.format(finalCommission),
                            maxWidth: '150px',
                        },
                        {
                            text: 'Date',
                            field: ({ createdAt }: { createdAt: string }) => new Date(createdAt).toLocaleDateString(),
                            maxWidth: '140px',
                        },
                    ]}
                />
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
})(withRouter(AffiliateTab));
