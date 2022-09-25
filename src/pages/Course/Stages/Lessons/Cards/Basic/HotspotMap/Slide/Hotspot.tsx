import React, { Component, MouseEventHandler } from 'react';

interface IProps {
    top: string;
    left: string;
    isViewed: boolean;
    isActive: boolean;
    onClick: (e: any) => Promise<void>;
    transform?: string;
    key: number;
    index: number;
}
export default class Hotspot extends Component<IProps> {
    render() {
        const { top, left, isViewed, isActive, onClick, transform } = this.props;

        return (
            <div
                className={`hotspotIcon${isActive ? ' hotspotIcon--active' : ''}`}
                style={{ top, left, transform }}
                onClick={onClick}
            >
                {isViewed && !isActive ? (
                    <i className='fa-solid fa-check' />
                ) : (
                    <div className={`hotspotIcon__internal${isActive ? ' hotspotIcon__internal--active' : ''}`} />
                )}
            </div>
        );
    }
}
