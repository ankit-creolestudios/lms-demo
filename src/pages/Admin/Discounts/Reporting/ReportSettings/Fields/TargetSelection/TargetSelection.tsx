import React, { Component } from 'react';
import './TargetSelection.scss';

interface IProps {
    currentTarget: string;
    onChange: (target: string) => void;
}

export default class TargetSelection extends Component<IProps> {
    handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        this.props.onChange(e.currentTarget.value);
    };

    render() {
        return (
            <select value={this.props.currentTarget} onChange={this.handleChange} className='target-selection'>
                {targetOptions.map((option, index) => {
                    return (
                        <option key={index} value={option.path}>
                            {option.label}
                        </option>
                    );
                })}
            </select>
        );
    }
}

const targetOptions = [
    {
        label: 'Code',
        path: 'code',
    },
    {
        label: 'Checkout Url',
        path: 'checkoutUrl',
    },
    {
        label: 'Package Names',
        path: 'packageNames',
    },
    {
        label: 'Discount Value',
        path: 'discountValue',
    },
    {
        label: 'Discount Type',
        path: 'discountType',
    },
    {
        label: 'Commission Value',
        path: 'commissionValue',
    },
    {
        label: 'Commission Type',
        path: 'commissionType',
    },
    {
        label: 'Use Limit',
        path: 'useLimit',
    },
    {
        label: 'Valid',
        path: 'isValid',
    },
    {
        label: 'Valid From',
        path: 'validAt',
    },
    {
        label: 'Invalid From',
        path: 'invalidAt',
    },
    {
        label: 'Description',
        path: 'generationGroup/description',
    },
    {
        label: 'Generation group id',
        path: 'generationGroupId',
    },
    {
        label: 'Created At',
        path: 'createdAt',
    },
    {
        label: 'Number of uses',
        path: 'usedCount',
    },
    {
        label: 'Discount',
        path: 'discount',
    },
];
