import React, { Component } from 'react';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';

export default class GenerationGroupListCodeSearch extends Component {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        generationGroupId: this.context.generationGroupId,
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            generationGroupId: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            generationGroupId: this.state.generationGroupId,
        });
    };

    render() {
        const { generationGroupId } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='search'>
                    <b>Search code</b>
                    <input value={generationGroupId} onChange={this.handleInputChange} type='text' name='search' />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
