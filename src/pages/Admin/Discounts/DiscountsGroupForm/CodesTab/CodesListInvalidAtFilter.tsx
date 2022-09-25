import React, { Component } from 'react';
import DatePicker from 'src/components/DatePicker/DatePicker';
import CodesListContext, {
    ICodesListContext,
} from 'src/pages/Admin/Discounts/DiscountsGroupForm/CodesTab/CodesListContext';

export default class CodesListInvalidAtFilter extends Component {
    static contextType?: React.Context<ICodesListContext> = CodesListContext;

    context!: React.ContextType<typeof CodesListContext>;

    state = {
        invalidAtFrom: this.context.invalidAtFrom,
        invalidAtUntil: this.context.invalidAtUntil,
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            invalidAtFrom: this.state.invalidAtFrom,
            invalidAtUntil: this.state.invalidAtUntil,
        });
    };

    render() {
        const { invalidAtFrom, invalidAtUntil } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='search'>
                    <b>Invalid at from</b>
                    <DatePicker
                        name='invalidAtFrom'
                        onChange={this.handleInputChange}
                        date={invalidAtFrom}
                        yearRange='both'
                        showClearDate
                    />
                </label>
                <label htmlFor='search'>
                    <b>Invalid at until</b>
                    <DatePicker
                        name='invalidAtUntil'
                        onChange={this.handleInputChange}
                        date={invalidAtUntil}
                        yearRange='both'
                        showClearDate
                    />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
