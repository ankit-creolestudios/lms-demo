import React, { Component } from 'react';
import QuizPage, { IProps as IQuizPageProps } from './Page/Quiz.page';
import QuizSlide, { IProps as IQuizSlideProps } from './Slide/Quiz.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/Quiz.page.scss';
import './Slide/Quiz.slide.scss';

type TProps = IQuizPageProps & IQuizSlideProps;

export default class Quiz extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <QuizPage {...this.props} />;
            case 'slide':
                return <QuizSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`quiz-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
