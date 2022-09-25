import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import CardButtons from 'src/components/CardButtons';
import './Text.slide.scss';

export interface IProps {
    heading?: string;
    subHeading?: string;
    content?: string;
    sourceImage?: string;
    theme?: string;
    info?: string;
}
export interface IState {}

export default class TextSlide extends Component<IProps> {
    render() {
        const { heading, subHeading, content, sourceImage, info } = this.props;
        return (
            <>
                <header>
                    {heading && <h1 className={subHeading ? '' : 'single'}>{heading}</h1>}
                    {subHeading && <h3 className={heading ? '' : 'single'}>{subHeading}</h3>}
                </header>
                {sourceImage && <FileImage fileId={sourceImage} />}
                <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
            </>
        );
    }
}
