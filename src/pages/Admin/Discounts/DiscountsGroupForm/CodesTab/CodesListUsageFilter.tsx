import React, { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';
import { IParams } from 'src/pages/Admin/Discounts/DiscountsGroupForm/DiscountsGroupForm';

type IProps = RouteComponentProps<IParams>;

export default class CodesListUsageFilter extends Component<IProps> {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        usage: this.context.usage ?? '',
    };

    handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            usage: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            usage: this.state.usage,
        });
    };

    render() {
        const { usage } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='packageIds'>
                    <b>Packages filter</b>
                    <select name='packageIds' value={usage} onChange={this.handleInputChange}>
                        <option value=''></option>
                        <option value='USED'>Used</option>
                        <option value='UNUSED'>Unused</option>
                    </select>
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
