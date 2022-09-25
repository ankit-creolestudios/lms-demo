import React, { Component } from 'react';
import { FileImage } from '../../../../components/ApiFile';
import CardButtons from '../../../../components/CardButtons';
import './TransitionCard.scss';

export default class TransitionCard extends Component {
    state = {
        infoOpen: false,
    };

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    render() {
        const { sourceImage, sourceIcon, content, iconPosition = 'TOP', info } = this.props;

        return (
            <div
                className={`lesson-cards__transition-type lesson-cards__transition-type--${iconPosition.toLowerCase()} ${
                    sourceImage ? ' transition-card-with-background-image' : ''
                }`}>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}
                {sourceImage && <FileImage fileId={sourceImage} />}
                {sourceIcon && (
                    <div className='lesson-cards__transition-type__icon'>
                        <FileImage fileId={sourceIcon} />
                    </div>
                )}
                <div className='lesson-cards__transition-type__content' dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        );
    }
}

