import React, { Component } from 'react';
import CourseContext from 'src/pages/Course/CourseContext';

interface IProps {
    id: string;
    handleClick: () => void;
}

export default class NextLessonButton extends Component<IProps> {
    static contextType = CourseContext;

    get isLessonLocked(): boolean {
        return !this.context.unlockedLessons.includes(this.props.id);
    }

    render() {
        return (
            <button onClick={this.props.handleClick} className='next' disabled={this.isLessonLocked}>
                Next
            </button>
        );
    }
}
