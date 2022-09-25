import React, { Component } from 'react';
import { IItemData } from '../Group';
import { TLegendItem } from '../Legend';
import './CalendarItem.scss';

export interface ICalendarItem {
    item: IItemData;
    rule: TLegendItem;
    originalIndex: number;
}

export default class CalendarItem extends Component<ICalendarItem> {
    handleClick = () => {
        const { item, originalIndex, rule } = this.props;
        rule.onClick(item, originalIndex);
    };

    get itemIcon() {
        const { rule, originalIndex } = this.props;
        if (!rule.icon) return <></>;
        if (rule.icon === 'index') {
            return <span>{originalIndex + 1}</span>;
        } else {
            return <i className={rule.icon} />;
        }
    }

    render() {
        const { rule } = this.props;

        return (
            <div style={rule.styleOverride} className={`calendar-item ${rule.style}`} onClick={this.handleClick}>
                {this.itemIcon}
            </div>
        );
    }
}
