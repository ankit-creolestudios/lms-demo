import React, { Component } from 'react';
import { IOptions } from '../../../../ReportingFields';
import Toggle from '../../../../../../../../../components/FormItems/Toggle';
import './Capitalisation.scss';

export interface IProps {
    handleChange: (key: keyof IOptions, value: any) => void;
    selectedOption?: TCapitalisationOptions;
}

type TCapitalisationOptions = 'none' | 'capitalise' | 'uppercase' | 'lowercase';

export default class Capitalisation extends Component<IProps, unknown> {
    selectOption = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.props.handleChange('capitalisation', e.target.name);
    };

    render() {
        return (
            <div className='capitalisation-option'>
                <div className='toggle-option'>
                    <Toggle
                        type='radio'
                        name='none'
                        id='none'
                        checked={this.props.selectedOption === 'none' || this.props.selectedOption === undefined}
                        onChange={this.selectOption}
                    />
                    <label htmlFor='none'>None</label>
                </div>
                <div className='toggle-option'>
                    <Toggle
                        type='radio'
                        name='capitalise'
                        id='capitalise'
                        checked={this.props.selectedOption === 'capitalise'}
                        onChange={this.selectOption}
                    />
                    <label htmlFor='capitalise'>Capitalise</label>
                </div>
                <div className='toggle-option'>
                    <Toggle
                        type='radio'
                        name='uppercase'
                        id='uppercase'
                        checked={this.props.selectedOption === 'uppercase'}
                        onChange={this.selectOption}
                    />
                    <label htmlFor='uppercase'>Uppercase</label>
                </div>
                <div className='toggle-option'>
                    <Toggle
                        type='radio'
                        name='lowercase'
                        id='lowercase'
                        checked={this.props.selectedOption === 'lowercase'}
                        onChange={this.selectOption}
                    />
                    <label htmlFor='lowercase'>Lowercase</label>
                </div>
            </div>
        );
    }
}
