import React, { Component } from 'react';
import { AsyncPreviewFileUpload } from '../../../../../../components/FileUpload';
import Editor from '../../../../../../components/Editor';
import './HorizontalListItem.scss';
import uuid from 'react-uuid';

export default class HorizontalListItem extends Component {
    state = {
        image: this.props.value.image ?? '',
        content: this.props.value.content ?? '',
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
        const { image, content } = this.state;
        return (
            <div className='hotspotlist__item'>
                <AsyncPreviewFileUpload
                    label='Image'
                    type='image'
                    name='image'
                    id={`hostspot-image-${uuid()}`}
                    file={image}
                    onChange={this.handleFileChange}
                />
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
