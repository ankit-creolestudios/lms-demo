import React, { Component, ReactNode } from 'react';
import './ProgressBar.scss';

interface IProps {
    progress: number;
}

export default class ProgressBar extends Component<IProps, unknown> {
    render(): ReactNode {
        const { progress } = this.props;
        return (
            <div className='progress-bar-container'>
                <div className='bar'>
                    <div className='progress' style={{ width: `${progress}%` }}></div>
                </div>
                <span>{progress}% Complete</span>
            </div>
        );
    }
}
