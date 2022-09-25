import React, { Component } from 'react';
import './Page/Document.page.scss';
import './Slide/Document.slide.scss';
import DocumentPage, { IProps as IDocumentPageProps } from './Page/Document.page';
import DocumentSlide, { IProps as IDocumentSlideProps } from './Slide/Document.slide';
import CourseContext from 'src/pages/Course/CourseContext';

type TProps = IDocumentPageProps & IDocumentSlideProps;

export default class Document extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <DocumentPage {...this.props} />;
            case 'slide':
                return <DocumentSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`document-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
