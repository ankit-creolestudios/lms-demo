import React, { Component } from 'react';
import './Page/Audio.page.scss';
import './Slide/Audio.slide.scss';
import AudioPage, { IProps as IAudioPageProps } from './Page/Audio.page';
import AudioSlide, { IProps as IAudioSlideProps } from './Slide/Audio.slide';
import CourseContext from 'src/pages/Course/CourseContext';

type TProps = IAudioPageProps & IAudioSlideProps;

export default class Audio extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <AudioPage {...this.props} />;
            case 'slide':
                return <AudioSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`audio-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
