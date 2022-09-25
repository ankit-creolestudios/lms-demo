import React from 'react';
import BaseCard from '../BaseCard';
import ThemeOptions from '../ThemeOptions';
import AsyncPreviewFileUpload from '../../../../../../components/FileUpload/AsyncPreviewFileUpload';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../../components/Editor';

export default class TranstionCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        content: this.props.content ?? '',
        sourceImage: this.props.sourceImage ?? '',
        sourceIcon: this.props.sourceIcon ?? '',
        iconPosition: this.props.iconPosition ?? 'TOP',
    };

    handleInputChange = (e) => {
        let input = e.target;
        let val;

        if (input.name === 'imageImportance') {
            val = input.value === 'preserveSizing' ? true : false;
        } else {
            val = input.value;
        }

        this.setState(
            {
                [input.name]: val,
            },
            this.dispatchLessonChange
        );
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

    render() {
        const {
            state: { content, sourceImage, sourceIcon, iconPosition, theme },
            props: { orderIndex },
        } = this;

        const imageImportance = this.state.imageImportance ? 'preserveSizing' : 'default';

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor={`iconPosition-${orderIndex}`}>Image location</label>
                    <select
                        name='iconPosition'
                        id={`iconPosition-${orderIndex}`}
                        value={iconPosition}
                        onChange={this.handleInputChange}>
                        <option value='TOP'>Top</option>
                        <option value='BOTTOM'>Bottom</option>
                        <option value='LEFT'>Left</option>
                        <option value='RIGHT'>Right</option>
                    </select>
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload background image'
                        type='image'
                        id={`sourceImage-${orderIndex}`}
                        name='sourceImage'
                        file={sourceImage}
                        onChange={this.handleFileChange}
                    />
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload icon'
                        type='image'
                        id={`sourceIcon-${orderIndex}`}
                        name='sourceIcon'
                        file={sourceIcon}
                        onChange={this.handleFileChange}
                    />
                </div>
                <div>
                    <label htmlFor={`content-${orderIndex}`}>Content</label>
                    <Editor
                        defaultValue={content}
                        name='content'
                        id={`content-${orderIndex}`}
                        onChange={this.handleInputChange}
                    />
                </div>
            </>
        );
    }
}