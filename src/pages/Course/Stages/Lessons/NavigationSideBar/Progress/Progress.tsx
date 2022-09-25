import React, { Component } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import CourseContext from '../../../../CourseContext';
import humanizeDuration from 'humanize-duration';
import './Progress.scss';

export default class Progress extends Component {
    static contextType = CourseContext;

    get hoursCompleted() {
        const hoursProgress = humanizeDuration(this.context.course.courseProgress * 60_000, {
            units: ['h'],
            round: true,
        });
        const totalHours = humanizeDuration((this.context.course.lessons?.totalRequiredTime ?? 0) * 60_000, {
            units: ['h'],
            round: true,
        });

        return `${hoursProgress.slice(0, -6)} of ${totalHours} completed`;
    }

    get daysLeft() {
        const daysLeft = humanizeDuration(Math.floor(new Date(this.context.course.expiresAt).getTime() - Date.now()), {
            units: ['d'],
            round: true,
        });

        return daysLeft;
    }

    render() {
        const { percentageProgress } = this.context.course;
        return (
            <div className='navigation-progress'>
                <CircularProgressbar
                    value={percentageProgress}
                    text={`${Math.floor(percentageProgress)}%`}
                    strokeWidth={14}
                />
                <span>{this.hoursCompleted}</span>
                <b>Expires in {this.daysLeft}</b>
            </div>
        );
    }
}
