import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { CourseContext } from './CourseContext';

export default class NavigationExam extends Component {
    static contextType = CourseContext;

    get redirectUrl() {
        const { data: course } = this.context;

        if (course.passedAt) {
            return `/courses/${course._id}/postexam`;
        }

        if (!course.preExamUpdatedAt) {
            return `/courses/${course._id}/preexam`;
        }

        return `/courses/${course._id}/exam`;
    }

    render() {
        const { data: course, canSitExam } = this.context;

        return (
            <div className={`final-exam-button${canSitExam ? '' : ' disabled'}`}>
                <Link to={this.redirectUrl} className={canSitExam ? 'bp' : 'bd'}>
                    Take final exam
                </Link>
            </div>
        );
    }
}
