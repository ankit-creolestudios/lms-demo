import React, { Component } from 'react';
import './Accordion.scss';
import AccordionContext from './AccordionContext';

export default class Accordion extends Component {
    state = {
        activeItems: Array.isArray(this.props.activeItems) ? new Set(this.props.activeItems) : new Set(),
    };

    isItemActive = (itemKey) => {
        return this.state.activeItems.has(itemKey);
    };

    render() {
        const { children } = this.props;

        return (
            <div className='unumbox-accordion'>
                <AccordionContext.Provider value={this.state}>{children}</AccordionContext.Provider>
            </div>
        );
    }
}
