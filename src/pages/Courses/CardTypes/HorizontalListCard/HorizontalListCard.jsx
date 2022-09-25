import React, { Component } from 'react';
import { FileImage } from '../../../../components/ApiFile';
import CardButtons from '../../../../components/CardButtons';
import './HorizontalListCard.scss';

export default class HorizontalListCard extends Component {
    state = {
        items: this.props.horizontalListItems || [],
        infoOpen: false,
    };

    componentDidUpdate(prevProps) {
        if (JSON.stringify(prevProps.horizontalListItems) !== JSON.stringify(this.props.horizontalListItems)) {
            this.setState({ items: this.props.horizontalListItems });
        }
    }

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    render() {
        const { heading, subHeading, content, info } = this.props;

        return (
            <div className='lesson-cards__horizontal-list-type'>
                {info && <CardButtons info={info} toggleInfo={this.toggleInfo} infoOpen={this.state.infoOpen} />}
                <div className='headings'>
                    <header>
                        {heading && <h1>{heading}</h1>}
                        {subHeading && <h3>{subHeading}</h3>}
                    </header>
                    {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
                </div>
                <div className='horizontal-list'>
                    {this.state.items.map((listItem, index) => (
                        <div key={index} className='list-item'>
                            {listItem.image && <FileImage fileId={listItem.image} />}
                            <div
                                className='text-content'
                                dangerouslySetInnerHTML={{
                                    __html: listItem.content,
                                }}></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
