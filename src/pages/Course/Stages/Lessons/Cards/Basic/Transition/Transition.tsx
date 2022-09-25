import React, { Component } from 'react';
import TransitionPage, { IProps as ITransitionPageProps } from './Page/Transition.page';
import TransitionSlide, { IProps as ITransitionSlideProps } from './Slide/Transition.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/Transition.page.scss';
import './Slide/Transition.slide.scss';

type TProps = ITransitionPageProps & ITransitionSlideProps;

export default class Transition extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <TransitionPage {...this.props} />;
            case 'slide':
                return <TransitionSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`transition-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
