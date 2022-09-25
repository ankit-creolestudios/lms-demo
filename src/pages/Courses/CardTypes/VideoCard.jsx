import React, { Component } from 'react';
import { VimeoPlayer } from '../../../components/VideoPlayer';
import CardButtons from '../../../components/CardButtons';
import './VideoCard.scss';

export default class VideoCard extends Component {
    state = {
        infoOpen: false,
    };

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    render() {
        const { videoId, transcript, info } = this.props;
        return (
            <div className='lesson-cards__video-type'>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}
                <VimeoPlayer videoId={videoId} width={532} height={300} />
                {!!transcript && <div className='transcript' dangerouslySetInnerHTML={{ __html: transcript }} />}
            </div>
        );
    }
}
