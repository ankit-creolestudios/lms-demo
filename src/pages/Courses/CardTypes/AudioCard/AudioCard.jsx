import React, { Component } from 'react';
import apiFile from '../../../../helpers/apiFile';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import {
    faPlay,
    faPause,
    faVolumeUp,
    faVolumeMute,
    faVolumeOff,
    faVolumeDown,
} from '@fortawesome/free-solid-svg-icons';
import CardButtons from '../../../../components/CardButtons';

import './AudioCard.scss';

export default class AudioCard extends Component {
    state = {
        fileUrl: '',
        isPlaying: false,
        volume: 1,
        currentTime: 0,
        duration: 0,
        isInfoOpen: false,
    };

    track = null;
    audioContext = null;
    audioRef = React.createRef();

    componentDidMount() {
        this.loadAudioFile();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.sourceAudio !== prevProps.sourceAudio) {
            this.loadAudioFile();
        }
    }

    loadAudioFile = async () => {
        const { sourceAudio } = this.props;

        this.setState(
            {
                fileUrl: await apiFile(sourceAudio),
            },
            () => {
                this.audioRef.current.volume = 1;
            }
        );
    };

    handlePlayButonClick = () => {
        const { isPlaying } = this.state;

        if (!isPlaying) {
            this.setState(
                {
                    isPlaying: true,
                },
                () => {
                    this.audioRef.current.play();
                }
            );
        } else {
            this.setState(
                {
                    isPlaying: false,
                },
                () => {
                    this.audioRef.current.pause();
                }
            );
        }
    };

    handleVolumeButtonClick = () => {
        const { isMuted } = this.state;

        if (!isMuted) {
            this.setState(
                {
                    isMuted: true,
                },
                () => {
                    this.audioRef.current.muted = true;
                }
            );
        } else {
            this.setState(
                {
                    isMuted: false,
                },
                () => {
                    this.audioRef.current.muted = false;
                }
            );
        }
    };

    handleMetaDataLoaded = () => {
        this.setState({
            duration: this.audioRef.current.duration,
        });
    };

    handleTimeUpdated = (e) => {
        this.setState({
            currentTime: this.audioRef.current.currentTime,
        });
    };

    handlePlaybackEnded = (e) => {
        this.setState({
            isPlaying: false,
        });
    };

    handleTrackClick = (e) => {
        const rect = e.target.getBoundingClientRect(),
            { duration } = this.state,
            trackClickPositionPercentage = ((e.clientX - rect.left) / 210) * 100;

        this.setState(
            {
                currentTime:
                    duration * ((trackClickPositionPercentage > 99 ? 100 : trackClickPositionPercentage) / 100),
            },
            () => {
                const { currentTime } = this.state;

                this.audioRef.current.currentTime = currentTime;
            }
        );
    };

    handleVolumeTrackClick = (e) => {
        const rect = e.target.getBoundingClientRect(),
            trackClickPositionPercentage = (e.clientX - rect.left) / 80;

        this.setState({ volume: trackClickPositionPercentage >= 0.95 ? 1 : trackClickPositionPercentage }, () => {
            const { volume } = this.state;

            this.audioRef.current.volume = volume;
        });
    };

    secondsToTimeStamp = (seconds) => {
        return new Date(seconds * 1000).toISOString().substr(14, 5);
    };

    toggleInfo = () => {
        this.setState({ isInfoOpen: !this.state.isInfoOpen });
    };

    get volumeLevelIcon() {
        const { isMuted, volume } = this.state;
        if (isMuted) {
            return faVolumeMute;
        }

        if (volume === 0) {
            return faVolumeOff;
        }

        if (volume < 0.5) {
            return faVolumeDown;
        }

        return faVolumeUp;
    }

    render() {
        const { isPlaying, isMuted, volume, currentTime, duration, isInfoOpen } = this.state,
            { heading, subHeading, transcript, info, content } = this.props;

        return (
            <div className='lesson-cards__audio-type'>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={isInfoOpen} />}
                <audio
                    controls='controls'
                    src={this.state.fileUrl}
                    ref={this.audioRef}
                    preload='metadata'
                    onDurationChange={this.handleMetaDataLoaded}
                    onTimeUpdate={this.handleTimeUpdated}
                    onEnded={this.handlePlaybackEnded}
                />
                <header>
                    <div className='lesson-cards__audio-type__player'>
                        <Fa icon={!isPlaying ? faPlay : faPause} onClick={this.handlePlayButonClick} />
                        <div className='lesson-cards__audio-type__body'>
                            <div className='lesson-cards__audio-type__track' onClick={this.handleTrackClick}>
                                <div style={{ width: `${(currentTime * 100) / duration}%` }}></div>
                            </div>
                            <div className='lesson-cards__audio-type__details'>
                                <div className='lesson-cards__audio-type__time'>
                                    {this.secondsToTimeStamp(currentTime)} / {this.secondsToTimeStamp(duration)}
                                </div>
                                <div className='lesson-cards__audio-type__volume'>
                                    <Fa icon={this.volumeLevelIcon} onClick={this.handleVolumeButtonClick} />
                                    <div onClick={this.handleVolumeTrackClick}>
                                        <div style={{ width: `${isMuted ? 0 : volume * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(heading || subHeading) && (
                        <div className='lesson-cards__audio-type__heading'>
                            {heading && <h1>{heading}</h1>}
                            {subHeading && <h3>{subHeading}</h3>}
                        </div>
                    )}
                </header>
                {transcript && (
                    <div
                        className='lesson-cards__audio-type__transcript'
                        dangerouslySetInnerHTML={{ __html: transcript }}
                    />
                )}
                {content && !transcript && (
                    <div className='lesson-cards__audio-type__content' dangerouslySetInnerHTML={{ __html: content }} />
                )}
            </div>
        );
    }
}

