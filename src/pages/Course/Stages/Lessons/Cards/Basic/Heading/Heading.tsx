import React, { Component } from 'react';
import HeadingPage, { IProps as IHeadingPageProps } from './Page/Heading.page';
import HeadingSlide, { IProps as IHeadingSlideProps } from './Slide/Heading.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/Heading.page.scss';
import './Slide/Heading.slide.scss';

type TProps = IHeadingPageProps & IHeadingSlideProps;

export default class Heading extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <HeadingPage {...this.props} />;
            case 'slide':
                return <HeadingSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`heading-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
