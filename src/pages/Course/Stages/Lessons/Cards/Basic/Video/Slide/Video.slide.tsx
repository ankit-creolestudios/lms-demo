import React, { Component } from 'react';
import { VimeoPlayer } from 'src/components/VideoPlayer';
import './Video.slide.scss';

export interface IProps {
    sourceVideo?: string;
    transcript?: string;
    theme?: string;
}

interface IState {}

export default class VideoSlide extends Component<IProps, IState> {
    render() {
        const { sourceVideo, transcript, theme } = this.props;
        return (
            <div className='video-type'>
                <VimeoPlayer videoId={sourceVideo} width={532} height={300} />
                {!!transcript && <div className='transcript' dangerouslySetInnerHTML={{ __html: transcript }} />}
            </div>
        );
    }
}
