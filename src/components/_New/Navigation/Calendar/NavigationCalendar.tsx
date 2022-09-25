import React, { Component } from 'react';
import CalendarLegend, { TCalendarLegend } from './Legend';
import CalendarGroup, { ICalendarGroup, IItemData } from './Group';
import './NavigationCalendar.scss';

export type TCalendar = TCalendarData & {
    className?: string;
    legend: TCalendarLegend;
};
type TCalendarData = { basic: TBasicCalendar; advanced?: never } | { basic?: never; advanced: TAdvancedCalendar };

export type TBasicCalendar = IItemData[];
export type TAdvancedCalendar = Record<string, TBasicCalendar>;

interface IState {
    legend: TCalendarLegend;
}

export default class NavigationCalendar extends Component<TCalendar, IState> {
    state: IState = {
        legend: this.props.legend,
    };

    toggleLegendItem = (index: number) => {
        const legend = [...this.state.legend];
        legend[index].disabled = !legend[index].disabled;

        this.setState({ legend });
    };

    get calendarGroups(): JSX.Element[] | null {
        const { basic, advanced, legend } = this.props;
        if (basic) return null;

        return Object.entries(this.props.advanced).reduce((acc: JSX.Element[], [title, items], index) => {
            return [...acc, <CalendarGroup key={index} title={title} items={items} rules={legend} />];
        }, []);
    }

    render() {
        const { className, basic, advanced } = this.props;
        const { legend } = this.state;

        return (
            <div className={`navigation-calendar ${className ?? ''}`}>
                <CalendarLegend legend={legend} onLegendToggle={this.toggleLegendItem} />
                {basic && <CalendarGroup items={basic} rules={legend} />}
                {advanced && this.calendarGroups}
            </div>
        );
    }
}
