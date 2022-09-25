import React, { Component } from 'react';
import { FileIFrame } from 'src/components/ApiFile';
import { Header } from '../../../Components';

export interface IProps {
    heading?: string;
    content?: string;
    sourceDocument?: string;
    theme?: string;
}

export default class DocumentPage extends Component<IProps> {
    render() {
        const { heading, content, sourceDocument } = this.props;
        return (
            <>
                {heading && <Header heading={heading} />}
                <div className='content'>
                    {!!content && (
                        <div
                            dangerouslySetInnerHTML={{
                                __html: content,
                            }}
                        ></div>
                    )}
                </div>
                <FileIFrame fileId={sourceDocument} />
            </>
        );
    }
}
