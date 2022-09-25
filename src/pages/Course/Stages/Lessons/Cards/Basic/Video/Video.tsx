import React, { Component } from 'react';
import './Page/Video.page.scss';
import './Slide/Video.slide.scss';
import VideoPage, { IProps as IVideoPageProps } from './Page/Video.page';
import VideoSlide, { IProps as IVideoSlideProps } from './Slide/Video.slide';
import CourseContext from 'src/pages/Course/CourseContext';

type TProps = IVideoPageProps & IVideoSlideProps;

export default class Video extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <VideoPage {...this.props} />;
            case 'slide':
                return <VideoSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`video-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
