import React, { Component } from 'react';
import CardButtons from 'src/components/CardButtons';
import './Heading.slide.scss';

export interface IProps {
    heading?: string;
    subHeading?: string;
    content?: string;
}

export default class HeadingSlide extends Component<IProps> {
    render() {
        const { heading, subHeading, content } = this.props;
        return (
            <>
                <header>
                    {heading && <h1 className={subHeading ? '' : 'single'}>{heading}</h1>}
                    {subHeading && <h3 className={heading ? '' : 'single'}>{subHeading}</h3>}
                </header>
                <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
            </>
        );
    }
}
