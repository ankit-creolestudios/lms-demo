import React, { Component } from 'react';
// import Player from '@vimeo/player';

export default class VimeoPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userInactive: false,
            playing: false,
        };
        this.vimeoIframe = React.createRef();
    }

    /*     componentDidMount() {
        const iframe = this.vimeoIframe.current;
        
        new Player(iframe);
    } */

    render() {
        const { videoId, width, height } = this.props;

        let newHeight;
        if (window.innerWidth < 800) {
            newHeight = window.innerWidth * 0.56375;
        } else {
            newHeight = height;
        }

        return (
            <iframe
                ref={this.vimeoIframe}
                src={`https://player.vimeo.com/video/${videoId}?player_id=vimeo${videoId}`}
                width={width}
                height={newHeight}
                frameBorder='0'
                allowFullScreen
                referrerPolicy='strict-origin-when-cross-origin'
            />
        );
    }
}
