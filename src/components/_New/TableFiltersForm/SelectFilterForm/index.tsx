import React, { Component } from 'react';
import { camelCase } from 'lodash';

export class SelectFilterForm extends Component<any, any> {
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

    handleInputChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.setState({
            formValue: e.target.value,
        });
        this.props.handleFormChange(this.props.keyName, e.target.value);
    };

    render() {
        const { name, optionData, optionKey, optionValue } = this.props;
        return (
            <div className='table__filter-form'>
                <label htmlFor='packageIds'>
                    <b>{name}</b>
                    <select name={camelCase(name)} value={this.state?.formValue} onChange={this.handleInputChange}>
                        <option value='' selected>
                            None
                        </option>
                        {optionData?.map((data: any, index: number) => (
                            <option key={index} value={data?.[optionKey]}>
                                {data?.[optionValue]}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
        );
    }
}
