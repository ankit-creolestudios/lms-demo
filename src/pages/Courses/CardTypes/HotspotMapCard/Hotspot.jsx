import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default class Hotspot extends Component {
    render() {
        const { top, left, isViewed, isActive, onClick, transform } = this.props;

        return (
            <div
                className={`hotspotIcon${isActive ? ' hotspotIcon--active' : ''}`}
                style={{ top, left, transform }}
                onClick={onClick}>
                {isViewed && !isActive ? (
                    <FontAwesomeIcon icon={faCheck} />
                ) : (
                    <div className={`hotspotIcon__internal${isActive ? ' hotspotIcon__internal--active' : ''}`} />
                )}
            </div>
        );
    }
}
