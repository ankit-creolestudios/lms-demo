import React, { Component } from 'react';
import './Page/Text.page.scss';
import './Slide/Text.slide.scss';
import TextPage, { IProps as ITextPageProps } from './Page/Text.page';
import TextSlide, { IProps as ITextSlideProps } from './Slide/Text.slide';
import CourseContext from 'src/pages/Course/CourseContext';
type TProps = ITextPageProps & ITextSlideProps;

export default class Text extends Component<TProps> {
    static contextType = CourseContext;

    renderCard = () => {
        switch (this.context.course.lessonType) {
            case 'page':
                return <TextPage {...this.props} />;
            case 'slide':
                return <TextSlide {...this.props} />;
            default:
                return <></>;
        }
    };
    render() {
        const { lessonType } = this.context.course;
        return (
            <div className={`text-${lessonType} theme-${(this.props.theme ?? '').toLowerCase()}`}>
                {this.renderCard()}
            </div>
        );
    }
}
