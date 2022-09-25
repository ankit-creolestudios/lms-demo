import React, { Component } from 'react';
import { IItemData } from '../Group';
import './CalendarLegend.scss';

export type TLegendItem = IIconSettings & {
    matches: (data: IItemData) => boolean;
    onClick: (data: IItemData, originalIndex: number) => void | Promise<void>;
    disabled?: boolean;
};

type IIconSettings =
    | {
          legendComponent: React.ComponentType<ICustomCalendarLegendComponent>;
          itemComponent: React.ComponentType<ICustomCalendarItemComponent>;
          name?: never;
          style?: never;
          icon?: never;
          styleOverride?: never;
      }
    | {
          legendComponent?: never;
          itemComponent?: never;
          name: string;
          style: 'red' | 'green' | 'yellow' | 'blue';
          icon?: 'index' | string;
          styleOverride?: React.CSSProperties;
      };

export interface ICustomCalendarLegendComponent {
    rule: TLegendItem;
    toggleLegend: () => void;
}

export interface ICustomCalendarItemComponent {
    originalIndex: number;
    rule: TLegendItem;
    item: IItemData;
}

export type TCalendarLegend = TLegendItem[];

interface IProps {
    legend: TLegendItem[];
    onLegendToggle: (index: number) => void;
}

export default class CalendarLegend extends Component<IProps> {
    getLegendIcon = (legend: TLegendItem, index: number) => {
        if (!legend.icon) return <></>;
        if (legend.icon === 'index') {
            return <></>;
        } else {
            return <i className={legend.icon} />;
        }
    };

    render() {
        const { legend, onLegendToggle } = this.props;

        return (
            <div className='calendar-legend'>
                {legend.map((legendItem: TLegendItem, index: number) => {
                    if (legendItem.legendComponent) {
                        const CustomLegendComponent = legendItem.legendComponent;
                        return (
                            <CustomLegendComponent
                                toggleLegend={() => onLegendToggle(index)}
                                key={index}
                                rule={legendItem}
                            />
                        );
                    }

                    return (
                        <div key={index} className={`calendar-legend-item ${legendItem.disabled ? 'disabled' : ''}`}>
                            <div
                                style={legendItem.styleOverride}
                                onClick={() => onLegendToggle(index)}
                                className={`icon-container ${legendItem.style}`}
                            >
                                {this.getLegendIcon(legendItem, index)}
                            </div>
                            <span>{legendItem.name}</span>
                        </div>
                    );
                })}
            </div>
        );
    }
}
