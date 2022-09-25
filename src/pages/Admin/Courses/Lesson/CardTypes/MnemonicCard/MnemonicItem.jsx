import React, { Component } from 'react';
import { AsyncPreviewFileUpload } from '../../../../../../components/FileUpload';
import Editor from '../../../../../../components/Editor';
import uuid from 'react-uuid';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class MnemonicItem extends Component {
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
        if (JSON.stringify(prevProps.value) !== JSON.stringify(this.props.value)) {
            this.setState({
                title: this.props.value.title ?? '',
                content: this.props.value.content ?? '',
                image: this.props.value.image ?? '',
            });
        } else if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
            this.props.onChange(null, this.state);
        }
    }

    render() {
        const { image, content, title } = this.state,
            { orderIndex } = this.props;

        return (
            <div className='mnemonic-item'>
                <AsyncPreviewFileUpload
                    label='Hotspot image'
                    type='image'
                    name='image'
                    id={`hostspot-image-${uuid()}`}
                    file={image}
                    onChange={this.handleFileChange}
                />
                <div>
                    <label htmlFor={`mnemonicLabel-${orderIndex}`}>Mnemonic title</label>
                    <TextInput
                        name='title'
                        type='text'
                        id={`mnemonicLabel-${orderIndex}`}
                        onChange={this.handleInputChange}
                        defaultValue={title}
                    />
                </div>
                <div>
                    <label htmlFor={`mnemoniccontent-${uuid()}`}>Mnemonic content</label>
                    <Editor
                        defaultValue={content}
                        name='content'
                        id={`mnemoniccontent-${uuid()}`}
                        onChange={this.handleInputChange}
                    />
                </div>
            </div>
        );
    }
}