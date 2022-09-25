import React, { Component } from 'react';
import { camelCase } from 'lodash';

export class InputFilterForm extends Component<any, any> {
    constructor(props: any) {
        super(props);
        this.state = {
            formValue: this.props.value ?? '',
        };
    }

    componentDidUpdate = (prevProps: any) => {
        if (prevProps.value !== this.props.value) {
            this.setState({
                formValue: this.props.value,
            });
        }
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            formValue: e.target.value,
        });
    };

    handleClickApply = () => {
        this.props.handleFormChange(this.props.keyName, this.state.formValue);
    };

    render() {
        const { name } = this.props;
        return (
            <div className='table__filter-form'>
                <label htmlFor={camelCase(name)}>
                    <b>{name}</b>
                    <input
                        value={this.state.formValue}
                        type='text'
                        name={camelCase(name)}
                        onChange={this.handleInputChange}
                    />
                </label>
                <button className='bp' onClick={this.handleClickApply}>
                    Apply
                </button>
            </div>
        );
    }
}
