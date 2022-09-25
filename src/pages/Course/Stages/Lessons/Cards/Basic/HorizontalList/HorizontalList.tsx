import React, { Component } from 'react';
import HorizontalListPage, { IProps as IHorizontalListPageProps } from './Page/HorizontalList.page';
import HorizontalListSlide, { IProps as IHorizontalListSlideProps } from './Slide/HorizontalList.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/HorizontalList.page.scss';
import './Slide/HorizontalList.slide.scss';

type TProps = IHorizontalListPageProps & IHorizontalListSlideProps;

export default class HorizontalList extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <HorizontalListPage {...this.props} />;
            case 'slide':
                return <HorizontalListSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`horizontal-list-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
