import React, { Component } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import { CourseContext } from '../../pages/Courses/CourseContext';
import './SmallProgress.scss';

export default class SmallProgress extends Component {
    static contextType = CourseContext;

    render() {
        const {
            data: { percentageProgress },
        } = this.context;

        return (
            <div className='cmenu__small-progress'>
                <CircularProgressbar value={percentageProgress} text={`${percentageProgress}%`} strokeWidth={14} />
            </div>
        );
    }
}
