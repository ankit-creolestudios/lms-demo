import React, { Component } from 'react';
import CardButtons from '../../../components/CardButtons';
import './HeadingCard.scss';

//TODO: add the info component here when it's built
export default class HeadingCard extends Component {
    state = {
        infoOpen: false,
    };

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    render() {
        const { heading, subHeading, content, info } = this.props;
        return (
            <div className='lesson-cards__heading-type'>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}
                <header>
                    {heading && <h1 className={subHeading ? '' : 'single'}>{heading}</h1>}
                    {subHeading && <h3 className={heading ? '' : 'single'}>{subHeading}</h3>}
                </header>
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        );
    }
}
