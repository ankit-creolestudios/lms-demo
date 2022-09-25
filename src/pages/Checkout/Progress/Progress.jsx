import React, { Component } from 'react';
import CheckoutContext from '../CheckoutContext';
import { GoCheck } from 'react-icons/go';
import { EventBus } from 'src/helpers/new';
import './Progress.scss';

export default class Progress extends Component {
    static contextType = CheckoutContext;

    switchTab = (targetTab) => {
        const { tabs, currentTab, switchTab } = this.context;
        if (targetTab === currentTab) {
            return;
        } else {
            const targetTabCompleted = tabs[targetTab].completed;

            if (targetTab === 0) {
                switchTab(targetTab);
            } else if (targetTabCompleted || tabs[targetTab - 1].completed) {
                switchTab(targetTab);
            } else {
                const eventMap = { 1: 'validate-contact-tab', 2: 'validate-address-tab', 3: 'validate-billing-tab' };
                EventBus.dispatch(eventMap[currentTab]);
            }
        }
    };

    render() {
        const { currentTab } = this.context;
        return (
            <>
                <div className='checkout-progress'>
                    {this.context.tabs.map((tab, index) => {
                        const isTabComplete = tab.completed,
                            isTabActive = currentTab === index;
                        return (
                            <div
                                className={`tab ${isTabActive ? 'active' : isTabComplete ? 'complete' : ''}`}
                                key={index}
                                onClick={() => {
                                    this.switchTab(index);
                                }}
                            >
                                <div>
                                    {!isTabActive && isTabComplete ? (
                                        <GoCheck />
                                    ) : (
                                        `${(index + 1).toString().padStart(2, '0')}`
                                    )}
                                </div>
                                <span>{tab.title}</span>
                            </div>
                        );
                    })}
                </div>
                <h4 className='checkout-progress__heading'>{this.context.tabs[currentTab].title}</h4>
            </>
        );
    }
}
