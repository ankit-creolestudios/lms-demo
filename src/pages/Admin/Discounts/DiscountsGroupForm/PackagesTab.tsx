import React, { Component } from 'react';
import { Badge } from 'react-bootstrap';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Api } from 'src/helpers/new';
import { ApiTable } from '../../../../components/ApiTable';
import DiscountsContext, { DiscountsContext as IDiscountsContext } from './DiscountsContext';
import { IParams } from './DiscountsGroupForm';

type IProps = RouteComponentProps<IParams> & {
    setGlobalAlert: any;
};

class PackagesTab extends Component<IProps> {
    static contextType: React.Context<IDiscountsContext> = DiscountsContext;

    // context!: React.ContextType<typeof DiscountsContext>;

    state = {
        packages: [],
        packageId: null,
        reloadTableCount: 0,
    };

    get discountGroupId() {
        return this.props.match.params.discountGroupId;
    }

    handleInputChange = (packageId: string) => async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let value: string | number = e.target.value;

        if (e.target.type === 'number') {
            value = parseInt(value);
        }

        await Api.call('put', `discounts/packages`, {
            packageId: packageId,
            [e.target.name]: value,
            discountGroupId: this.discountGroupId,
        });
    };

    handleChangePackageStatus =
        (packageId: string, key: 'allowUse' | 'allowGeneration', value: boolean) => async () => {
            await Api.call('put', `discounts/packages`, {
                packageId: packageId,
                [key]: !value,
                discountGroupId: this.discountGroupId,
            });

            this.setState({
                reloadTableCount: this.state.reloadTableCount + 1,
            });
        };

    render() {
        const { reloadTableCount } = this.state;

        return (
            <div className='pt-4 pb-1'>
                <ApiTable
                    apiCall={{ method: 'GET', path: `/discounts/groups/${this.discountGroupId}/packages` }}
                    columns={[
                        {
                            text: 'Allow use',
                            field: ({ allowUse, _id }: { allowUse: boolean; _id: string }) => (
                                <Badge
                                    pill
                                    variant={allowUse ? 'success' : 'dark'}
                                    style={{ cursor: 'pointer', height: '21px', padding: '5px 0' }}
                                    onClick={this.handleChangePackageStatus(_id, 'allowUse', allowUse)}
                                >
                                    {allowUse || allowUse === undefined ? 'ENABLED' : 'DISABLED'}
                                </Badge>
                            ),
                            maxWidth: '90px',
                        },
                        {
                            text: 'Allow generation',
                            field: ({ allowGeneration, _id }: { allowGeneration: boolean; _id: string }) => (
                                <Badge
                                    pill
                                    variant={allowGeneration ? 'success' : 'dark'}
                                    style={{ cursor: 'pointer', height: '21px', padding: '5px 0' }}
                                    onClick={this.handleChangePackageStatus(_id, 'allowGeneration', allowGeneration)}
                                >
                                    {allowGeneration || allowGeneration === undefined ? 'ENABLED' : 'DISABLED'}
                                </Badge>
                            ),
                            maxWidth: '90px',
                        },
                        {
                            text: 'Name',
                            field: ({ title }: { title: string }) => (
                                <span className='oneline-text' title={title}>
                                    {title}
                                </span>
                            ),
                            maxWidth: '300px',
                        },
                        {
                            text: 'Discount type',
                            field: ({ discountType, _id }: { discountType: string; _id: string }) => (
                                <select
                                    name='discountType'
                                    defaultValue={discountType}
                                    onChange={this.handleInputChange(_id)}
                                >
                                    <option value='PERCENTAGE'>Percentage</option>
                                    <option value='FIXED'>Fixed</option>
                                </select>
                            ),
                        },
                        {
                            text: 'Discount value',
                            field: ({ discountValue, _id }: { discountValue: string; _id: string }) => (
                                <input
                                    type='number'
                                    name='discountValue'
                                    defaultValue={discountValue}
                                    onChange={this.handleInputChange(_id)}
                                />
                            ),
                        },
                        {
                            text: 'Comission type',
                            field: ({ commissionType, _id }: { commissionType: string; _id: string }) => (
                                <select
                                    name='commissionType'
                                    defaultValue={commissionType}
                                    onChange={this.handleInputChange(_id)}
                                >
                                    <option value='PERCENTAGE'>Percentage</option>
                                    <option value='FIXED'>Fixed</option>
                                </select>
                            ),
                        },
                        {
                            text: 'Commission value',
                            field: ({ commissionValue, _id }: { commissionValue: string; _id: string }) => (
                                <input
                                    type='number'
                                    name='commissionValue'
                                    defaultValue={commissionValue}
                                    onChange={this.handleInputChange(_id)}
                                />
                            ),
                        },
                    ]}
                    reload={reloadTableCount}
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
})(withRouter(PackagesTab));
