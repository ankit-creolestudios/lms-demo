import React, { Component } from 'react';
import DatePicker from 'src/components/DatePicker/DatePicker';
import GenerationGroupsContext, { IGenerationGroupsContext } from './GenerationGroupsContext';

export default class GenerationGroupsValidAtFilter extends Component {
    static contextType?: React.Context<IGenerationGroupsContext> = GenerationGroupsContext;

    context!: React.ContextType<typeof GenerationGroupsContext>;

    state = {
        validAtFrom: this.context.validAtFrom,
        validAtUntil: this.context.validAtUntil,
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleClickApply = () => {
        this.context.setFilter({
            validAtFrom: this.state.validAtFrom,
            validAtUntil: this.state.validAtUntil,
        });
    };

    render() {
        const { validAtFrom, validAtUntil } = this.state;

        return (
            <div className='table__filter-form'>
                <label htmlFor='validAtFrom'>
                    <b>Valid at from</b>
                    <DatePicker
                        name='validAtFrom'
                        onChange={this.handleInputChange}
                        date={validAtFrom}
                        yearRange='both'
                        showClearDate
                    />
                </label>
                <label htmlFor='validAtUntil'>
                    <b>Valid at until</b>
                    <DatePicker
                        name='validAtUntil'
                        onChange={this.handleInputChange}
                        date={validAtUntil}
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
