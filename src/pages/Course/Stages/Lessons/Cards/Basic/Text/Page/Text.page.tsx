import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import { Header } from 'src/pages/Course/Stages/Lessons/Cards/Components';

export interface IProps {
    heading?: string;
    subHeading?: string;
    content?: string;
    sourceImage?: string;
}

export default class TextPage extends Component<IProps> {
    render() {
        const { heading, subHeading, content, sourceImage } = this.props;

        return (
            <>
                {(heading || subHeading) && <Header heading={heading} subHeading={subHeading} />}
                <div className='content'>
                    {sourceImage && <FileImage fileId={sourceImage} />}
                    <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
                </div>
            </>
        );
    }
}
