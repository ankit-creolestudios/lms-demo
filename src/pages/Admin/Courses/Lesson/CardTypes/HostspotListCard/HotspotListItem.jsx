import React, { Component } from 'react';
import { AsyncPreviewFileUpload } from '../../../../../../components/FileUpload';
import Editor from '../../../../../../components/Editor';
import './HotspotListItem.scss';
import uuid from 'react-uuid';

export default class HotspotListItem extends Component {
    state = {
        image: this.props.value.image ?? '',
        content: this.props.value.content ?? '',
        title: this.props.value.title ?? '',
    };

    handleFileChange = (e, file) => {
        const input = e.target;

        this.setState(
            {
                [input.name]: file,
            },
            this.dispatchLessonChange
        );
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState(
            {
                [input.name]: input.value,
            },
            this.dispatchLessonChange
        );
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
            this.props.onChange(null, this.state);
        }
    }

    render() {
        const { image, content, title } = this.state,
            { orderIndex } = this.props;

        return (
            <div className='hotspotlist__item'>
                <AsyncPreviewFileUpload
                    label='Hotspot image'
                    type='image'
                    name='image'
                    id={`hostspot-image-${uuid()}`}
                    file={image}
                    onChange={this.handleFileChange}
                />
                <div>
                    <label htmlFor={`hotspotLabel-${orderIndex}`}>Hotspot title</label>
                    <input
                        name='title'
                        type='text'
                        id={`hotspotLabel-${orderIndex}`}
                        onChange={this.handleInputChange}
                        defaultValue={title}></input>
                </div>
                <div>
                    <label htmlFor={`hotspotcontent-${uuid()}`}>Hotspot content</label>
                    <Editor
                        defaultValue={content}
                        name='content'
                        id={`hotspotcontent-${uuid()}`}
                        onChange={this.handleInputChange}
                    />
                </div>
            </div>
        );
    }
}
