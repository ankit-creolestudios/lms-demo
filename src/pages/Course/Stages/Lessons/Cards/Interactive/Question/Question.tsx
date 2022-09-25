import React, { Component } from 'react';
import QuestionSlide from './Slide/Question.slide';
import CourseContext from 'src/pages/Course/CourseContext';

interface IProps {
    cardIndex?: string;
    heading?: string;
    subHeading?: string;
    nextCardAvailable?: string;
    setNextCardAvailable?: string;
    bgColor?: string;
    fgColor?: string;
    questions?: any;
    questionAttempt?: any;
    id?: string;
    detailedQuestion?: string;
    questionType?: string;
    correctFeedback?: string;
    incorrectFeedback?: string;
    content?: string;
    updateBlockingCardIndex?: string;
    result?: any;
    userAnswers?: any;
    theme?: string;
}

export default class Question extends Component<IProps> {
    static contextType = CourseContext;
    render() {
        return (
            <div
                className={`question-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                <QuestionSlide {...this.props} />
            </div>
        );
    }
}
