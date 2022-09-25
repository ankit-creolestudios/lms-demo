import React, { Component } from 'react';
import HotspotMapPage, { IProps as IHotspotMapPageProps } from './Page/HotspotMap.page';
import HotspotMapSlide, { IProps as IHotspotMapSlideProps } from './Slide/HotspotMap.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/HotspotMap.page.scss';
import './Slide/HotspotMap.slide.scss';

type TProps = IHotspotMapPageProps & IHotspotMapSlideProps;

export default class HotspotMap extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <HotspotMapPage {...this.props} />;
            case 'slide':
                return <HotspotMapSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`hotspot-map-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
