import React, { Component } from 'react';
import MnemonicPage, { IProps as IMnemonicPageProps } from './Page/Mnemonic.page';
import MnemonicSlide, { IProps as IMnemonicSlideProps } from './Slide/Mnemonic.slide';
import CourseContext from 'src/pages/Course/CourseContext';
import './Page/Mnemonic.page.scss';
import './Slide/Mnemonic.slide.scss';

type TProps = IMnemonicPageProps & IMnemonicSlideProps;

export default class Mnemonic extends Component<TProps> {
    static contextType = CourseContext;
    renderCard() {
        switch (this.context.course.lessonType) {
            case 'page':
                return <MnemonicPage {...this.props} />;
            case 'slide':
                return <MnemonicSlide {...this.props} />;
            default:
                return <></>;
        }
    }
    render() {
        return (
            <div
                className={`mnemonic-${this.context.course.lessonType} theme-${(
                    this.props.theme ?? ''
                ).toLocaleLowerCase()}`}
            >
                {this.renderCard()}
            </div>
        );
    }
}
