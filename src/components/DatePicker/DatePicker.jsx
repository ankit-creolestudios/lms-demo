import moment from 'moment';
import React, { Component } from 'react';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

export default class DatePicker extends Component {
    state = {
        focused: null,
    };

    renderMonthElement = ({ month, onMonthSelect, onYearSelect }) => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div>
                    <select value={month.month()} onChange={(e) => onMonthSelect(month, e.target.value)}>
                        {moment.months().map((label, value) => (
                            <option key={`${value}-${this.props.id}`} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <select value={month.year()} onChange={(e) => onYearSelect(month, e.target.value)}>
                        {this.returnYears()}
                    </select>
                </div>
            </div>
        );
    };

    returnYears = () => {
        let years = [];
        const { yearRange = 'lower' } = this.props;

        for (
            let i = moment().year() - (yearRange !== 'upper' ? 100 : 0);
            i <= moment().year() + (yearRange !== 'lower' ? 100 : 0);
            i++
        ) {
            years.push(
                <option key={`year-${i}`} value={i}>
                    {i}
                </option>
            );
        }
        return years;
    };

    render() {
        return (
            <>
                {this.props.label ? (
                    <label htmlFor={this.props.id}>
                        {this.props.isFormElement ? (
                            <label>
                                {this.props.label ? this.props.label : ''}
                                {!!this.props.description && <small>{this.props.description}</small>}
                            </label>
                        ) : (
                            <strong>{this.props.label ? this.props.label : ''}</strong>
                        )}
                    </label>
                ) : (
                    <></>
                )}
                <SingleDatePicker
                    required={this.props.required ? true : false}
                    numberOfMonths={1}
                    showClearDate={this.props.showClearDate}
                    renderMonthElement={!this.props.noRange && this.renderMonthElement}
                    block={true}
                    isOutsideRange={() => false}
                    onDateChange={(date) => {
                        if (date) {
                            if (!this.props.raw) {
                                date = date.format('YYYY-MM-DD');
                            }
                        } else {
                            date = null;
                        }
                        if (this.props.handleDateChange) {
                            this.props.handleDateChange(this.props.id, date);
                        }

                        if (this.props.onChange) {
                            this.props.onChange({
                                target: {
                                    name: this.props.name,
                                    value: date,
                                },
                            });
                        }
                    }}
                    onFocusChange={({ focused }) => {
                        this.setState({ focused });
                    }}
                    focused={this.state.focused}
                    id={this.props.id}
                    date={this.props.date ? moment(this.props.date) : undefined}
                    placeholder='MM/DD/YYYY'
                    displayFormat='MM/DD/YYYY'
                    readOnly
                />
            </>
        );
    }
}
