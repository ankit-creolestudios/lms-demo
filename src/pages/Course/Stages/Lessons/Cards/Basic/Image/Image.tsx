import React, { Component } from 'react';
import ImagePage, { IProps as IImagePageProps } from './Page/Image.page';
import ImageSlide, { IProps as IImageSlideProps } from './Slide/Image.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/Image.page.scss';
import './Slide/Image.slide.scss';

type TProps = IImagePageProps & IImageSlideProps;

export default class Image extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <ImagePage {...this.props} />;
            case 'slide':
                return <ImageSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`image-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
