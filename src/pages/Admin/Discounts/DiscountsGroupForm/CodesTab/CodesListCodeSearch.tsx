import React, { Component } from 'react';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';

export default class CodesListCodeSearch extends Component {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        codeSearch: this.context.codeSearch,
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            codeSearch: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            codeSearch: this.state.codeSearch,
        });
    };

    render() {
        const { codeSearch } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='search'>
                    <b>Search code</b>
                    <input value={codeSearch} onChange={this.handleInputChange} type='text' name='search' />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
