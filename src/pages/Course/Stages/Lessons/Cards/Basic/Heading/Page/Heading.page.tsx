import React, { Component } from 'react';
import { Header } from '../../../Components';

export interface IProps {
    heading?: string;
    subHeading?: string;
    content?: string;
    theme?: string;
}

export default class HeadingPage extends Component<IProps> {
    render() {
        const { heading, subHeading, content } = this.props;

        return (
            <>
                {(heading || subHeading) && <Header heading={heading} subHeading={subHeading} />}
                <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
            </>
        );
    }
}
