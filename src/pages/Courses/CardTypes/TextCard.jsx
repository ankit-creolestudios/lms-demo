import React, { Component } from 'react';
import { FileImage } from '../../../components/ApiFile';
import CardButtons from '../../../components/CardButtons';
import './TextCard.scss';

//TODO: add the info component here when it's built
export default class TextCard extends Component {
    state = {
        infoOpen: false,
    };

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    render() {
        const { heading, subHeading, content, info, sourceImage } = this.props;
        return (
            <div className='lesson-cards__text-type'>
                {/* Adding info toggle buttons and modal */}
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}

                <div className='text-card-content'>
                    <header>
                        {heading && <h1 className={subHeading ? '' : 'single'}>{heading}</h1>}
                        {subHeading && <h3 className={heading ? '' : 'single'}>{subHeading}</h3>}
                    </header>
                    {sourceImage && <FileImage fileId={sourceImage} />}
                    {/* Moved image inside of text-card-content */}
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            </div>
        );
    }
}
