import React, { Component } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import apiCall from 'src/helpers/apiCall';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';
import { IParams } from 'src/pages/Admin/Discounts/DiscountsGroupForm/DiscountsGroupForm';

type IProps = RouteComponentProps<IParams>;

class CodesListPackageFilter extends Component<IProps> {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        packageIds: this.context.packageIds,
        groupPackages: [],
    };

    async componentDidMount() {
        await this.loadDiscountGroupPackages();
    }

    loadDiscountGroupPackages = async () => {
        const { discountGroupId } = this.props.match.params;
        const { success, response, message } = await apiCall(
            'GET',
            `/discounts/groups/${discountGroupId}/packages?perPage=999`
        );

        if (success) {
            this.setState({
                groupPackages: response.docs,
            });
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            packageIds: [...e.target.selectedOptions].map((option) => option.value),
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            packageIds: this.state.packageIds,
        });
    };

    render() {
        const { packageIds, groupPackages } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='packageIds'>
                    <b>Packages filter</b>
                    <select name='packageIds' value={packageIds} onChange={this.handleInputChange} multiple>
                        {groupPackages.map((groupPackage: any) => (
                            <option key={groupPackage.packageId} value={groupPackage.packageId}>
                                {groupPackage.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}

export default withRouter(CodesListPackageFilter);
