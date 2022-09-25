import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import './HotspotPoint.scss';

export default class HotspotPoint extends Component {
    render() {
        const { isViewed, isActive, onClick, className } = this.props;

        return (
            <div className={`hotspotIcon${isActive ? ' hotspotIcon--active' : ''} ${className}`} onClick={onClick}>
                {isViewed && !isActive ? (
                    <FontAwesomeIcon icon={faCheck} />
                ) : (
                    <div className={`hotspotIcon__internal${isActive ? ' hotspotIcon__internal--active' : ''}`} />
                )}
            </div>
        );
    }
}

