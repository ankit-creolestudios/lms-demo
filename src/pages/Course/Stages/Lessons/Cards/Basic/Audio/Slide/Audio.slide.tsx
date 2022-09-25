import React, { Component } from 'react';
import apiFile from 'src/helpers/apiFile';
import './Audio.slide.scss';

export interface IProps {
    heading?: string;
    subHeading?: string;
    transcript?: string;
    content?: string;
    sourceAudio?: string;
    theme?: string;
    info?: string;
}

interface IState {
    fileUrl: string;
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    isMuted?: boolean;
}

export default class AudioSlide extends Component<IProps, IState> {
    state: IState = {
        fileUrl: '',
        isPlaying: false,
        volume: 1,
        currentTime: 0,
        duration: 0,
    };

    track = null;
    audioContext = null;
    audioRef: React.RefObject<HTMLAudioElement> = React.createRef();

    componentDidMount() {
        this.loadAudioFile();
    }

    componentDidUpdate(prevProps: IProps, prevState: IState) {
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
                if (this.audioRef.current !== null) this.audioRef.current.volume = 1;
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
                    this.audioRef?.current?.play();
                }
            );
        } else {
            this.setState(
                {
                    isPlaying: false,
                },
                () => {
                    this.audioRef?.current?.pause();
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
                    if (this.audioRef.current !== null) this.audioRef.current.muted = true;
                }
            );
        } else {
            this.setState(
                {
                    isMuted: false,
                },
                () => {
                    if (this.audioRef.current !== null) this.audioRef.current.muted = false;
                }
            );
        }
    };

    handleMetaDataLoaded = () => {
        if (this.audioRef.current !== null) this.setState({ duration: this.audioRef.current.duration });
    };

    handleTimeUpdated = (e: any) => {
        if (this.audioRef.current !== null) this.setState({ currentTime: this.audioRef?.current?.currentTime });
    };

    handlePlaybackEnded = (e: any) => {
        this.setState({
            isPlaying: false,
        });
    };

    handleTrackClick = (e: any) => {
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

                if (this.audioRef.current !== null) this.audioRef.current.currentTime = currentTime;
            }
        );
    };

    handleVolumeTrackClick = (e: any) => {
        const rect = e.target.getBoundingClientRect(),
            trackClickPositionPercentage = (e.clientX - rect.left) / 80;

        this.setState({ volume: trackClickPositionPercentage >= 0.95 ? 1 : trackClickPositionPercentage }, () => {
            const { volume } = this.state;
            if (this.audioRef.current !== null) this.audioRef.current.volume = volume;
        });
    };

    secondsToTimeStamp = (seconds: number) => {
        return new Date(seconds * 1000).toISOString().substr(14, 5);
    };

    get volumeLevelIcon() {
        const { isMuted, volume } = this.state;
        if (isMuted) {
            return 'fa-volume-mute';
        }

        if (volume === 0) {
            return 'fa-volume-off';
        }

        if (volume < 0.5) {
            return 'fa-volume-low';
        }

        return 'fa-volume-high';
    }

    render() {
        const { isPlaying, isMuted, volume, currentTime, duration } = this.state,
            { heading, subHeading, transcript, theme, content } = this.props;

        return (
            <>
                <audio
                    controls
                    src={this.state.fileUrl}
                    ref={this.audioRef}
                    preload='metadata'
                    onDurationChange={this.handleMetaDataLoaded}
                    onTimeUpdate={this.handleTimeUpdated}
                    onEnded={this.handlePlaybackEnded}
                />
                <header>
                    <div className={`player ${theme === 'navy' ? 'white-controls' : ''} `}>
                        <i
                            className={`play-pause fa-solid fa-${!isPlaying ? 'play' : 'pause'}`}
                            onClick={this.handlePlayButonClick}
                        ></i>
                        <div className='body'>
                            <div className='track' onClick={this.handleTrackClick}>
                                <div
                                    className={`${theme === 'navy' ? 'white-controls' : ''}`}
                                    style={{ width: `${(currentTime * 100) / duration}%` }}
                                ></div>
                            </div>
                            <div className='details'>
                                <div className='time'>
                                    {this.secondsToTimeStamp(currentTime)} / {this.secondsToTimeStamp(duration)}
                                </div>
                                <div className='volume'>
                                    <i
                                        className={`fa-solid ${this.volumeLevelIcon}`}
                                        onClick={this.handleVolumeButtonClick}
                                    ></i>
                                    <div onClick={this.handleVolumeTrackClick}>
                                        <div
                                            className={`${theme === 'navy' ? 'white-controls' : ''}`}
                                            style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {(heading || subHeading) && (
                        <div className='heading'>
                            {heading && <h1>{heading}</h1>}
                            {subHeading && <h3>{subHeading}</h3>}
                        </div>
                    )}
                </header>
                {transcript && <div className='transcript' dangerouslySetInnerHTML={{ __html: transcript }} />}
                {content && !transcript && <div className='content' dangerouslySetInnerHTML={{ __html: content }} />}
            </>
        );
    }
}
