import React, { Component } from 'react';
import { TCalendarLegend, TLegendItem } from '../Legend';
import CalendarItem, { ICalendarItem } from '../Item';
import './CalendarGroup.scss';

export interface ICalendarGroup {
    title?: string;
    items: IItemData[];
    rules: TCalendarLegend;
}

export type IItemData = Record<string, any>;

interface IState {
    minimised: boolean;
}

export default class CalendarGroup extends Component<ICalendarGroup, IState> {
    state: IState = {
        minimised: false,
    };

    get items(): JSX.Element[] {
        const { items, rules } = this.props;
        return items.reduce((acc: JSX.Element[], item: IItemData, index: number) => {
            for (const rule of rules) {
                if (rule.matches(item)) {
                    if (!!rule.disabled) {
                        return acc;
                    }
                    if (rule.itemComponent) {
                        const CustomItemComponent = rule.itemComponent;
                        return [
                            ...acc,
                            <CustomItemComponent key={index} originalIndex={index} item={item} rule={rule} />,
                        ];
                    } else {
                        return [...acc, <CalendarItem key={index} item={item} rule={rule} originalIndex={index} />];
                    }
                }
            }

            return acc;
        }, []);
    }

    toggleGroup = () => {
        this.setState({ minimised: !this.state.minimised });
    };

    render() {
        const { title } = this.props;
        const { minimised } = this.state;

        return (
            <div className='calendar-group'>
                {!title ? (
                    <div className='item-list'>{this.items}</div>
                ) : (
                    <div className='group-container'>
                        <i onClick={this.toggleGroup} className={`fa fa-chevron-${minimised ? 'right' : 'down'}`} />
                        <span className={minimised ? '' : 'expanded'} onClick={this.toggleGroup}>
                            {title}
                        </span>
                        {!minimised && <div className='item-list'>{this.items}</div>}
                    </div>
                )}
            </div>
        );
    }
}
