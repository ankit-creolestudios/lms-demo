import React, { Component } from 'react';
import HotspotListPage, { IProps as IHotspotListPageProps } from './Page/HotspotList.page';
import HotspotListSlide, { IProps as IHotspotListSlideProps } from './Slide/HotspotList.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/HotspotList.page.scss';
import './Slide/HotspotList.slide.scss';

type TProps = IHotspotListPageProps & IHotspotListSlideProps;

export default class HotspotList extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <HotspotListPage {...this.props} />;
            case 'slide':
                return <HotspotListSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`hotspot-list-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
