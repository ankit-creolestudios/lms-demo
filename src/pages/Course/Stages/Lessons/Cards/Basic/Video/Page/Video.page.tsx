import React, { Component } from 'react';
import { VimeoPlayer } from 'src/components/VideoPlayer';

export interface IProps {
    sourceVideo?: string;
    transcript?: string;
    theme?: string;
}

export default class VideoPage extends Component<IProps> {
    render() {
        const { sourceVideo, transcript } = this.props;
        return (
            <>
                <VimeoPlayer videoId={sourceVideo} width={800} height={451} />
                {!!transcript && <div className='transcript' dangerouslySetInnerHTML={{ __html: transcript }} />}
            </>
        );
    }
}
