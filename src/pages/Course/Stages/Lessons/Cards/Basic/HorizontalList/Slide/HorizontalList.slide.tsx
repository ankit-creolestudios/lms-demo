import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import './HorizontalList.slide.scss';

interface IHorizontalListItem {
    image: string;
    content: string;
}

export interface IProps {
    horizontalListItems: IHorizontalListItem[];
    heading?: string;
    subHeading?: string;
    content?: string;
    theme?: string;
}

export default class HorizontalListSlide extends Component<IProps> {
    state = {
        items: this.props.horizontalListItems || [],
    };

    componentDidUpdate(prevProps: any) {
        if (JSON.stringify(prevProps.horizontalListItems) !== JSON.stringify(this.props.horizontalListItems)) {
            this.setState({ items: this.props.horizontalListItems });
        }
    }

    render() {
        const { heading, subHeading, content } = this.props;

        return (
            <>
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
                                }}
                            ></div>
                        </div>
                    ))}
                </div>
            </>
        );
    }
}
