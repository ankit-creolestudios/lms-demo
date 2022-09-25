import React, { Component } from 'react';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';

export default class CodesListDescSearch extends Component {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        descriptionSearch: this.context.descriptionSearch,
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            descriptionSearch: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            descriptionSearch: this.state.descriptionSearch,
        });
    };

    render() {
        const { descriptionSearch } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='search'>
                    <b>Search code</b>
                    <input value={descriptionSearch} onChange={this.handleInputChange} type='text' name='search' />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
