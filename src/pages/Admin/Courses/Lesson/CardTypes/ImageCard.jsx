import React from 'react';
import BaseCard from './BaseCard';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../components/Editor';
import { AsyncPreviewFileUpload } from '../../../../../components/FileUpload';
import ThemeOptions from './ThemeOptions';
import TextInput from '../../../../../components/inputs/TextInput';

export default class ImageCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
        sourceImage: this.props.sourceImage ?? '',
        imageUrl: this.props.imageUrl ?? '',
        imagePosition: this.props.imagePosition ?? 'LEFT',
        imageImportance: this.props.imageImportance ?? false,
        allowEnlargeImage: this.props.allowEnlargeImage ?? false,
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
            state: {
                heading,
                subHeading,
                content,
                sourceImage,
                imageUrl,
                imagePosition,
                info,
                theme,
                allowEnlargeImage,
            },
            props: { orderIndex },
        } = this;

        const imageImportance = this.state.imageImportance ? 'preserveSizing' : 'default';

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor={`heading-${orderIndex}`}>Heading</label>
                    <TextInput
                        type='text'
                        name='heading'
                        id={`heading-${orderIndex}`}
                        value={heading}
                        onChange={this.handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor={`subHeading-${orderIndex}`}>Subheading</label>
                    <TextInput
                        type='text'
                        name='subHeading'
                        id={`subHeading-${orderIndex}`}
                        value={subHeading}
                        onChange={this.handleInputChange}
                    />
                </div>
                <div>
                    <ul>
                        <li>
                            <label htmlFor={`imagePosition-${orderIndex}`}>Image location</label>
                            <select
                                name='imagePosition'
                                id={`imagePosition-${orderIndex}`}
                                value={imagePosition}
                                onChange={this.handleInputChange}>
                                <option value='TOP'>Top</option>
                                <option value='LEFT'>Left</option>
                                <option value='RIGHT'>Right</option>
                                <option value='BG'>Background</option>
                            </select>
                        </li>
                        <li>
                            <label htmlFor={`imageUrl-${orderIndex}`}>External URL</label>
                            <input
                                type='text'
                                name='imageUrl'
                                id={`imageUrl-${orderIndex}`}
                                value={imageUrl}
                                onChange={this.handleInputChange}
                            />
                        </li>
                    </ul>
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload image'
                        type='image'
                        id={`sourceImage-${orderIndex}`}
                        name='sourceImage'
                        file={sourceImage}
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
                <Accordion as='footer' className='lesson-cards__item__extras'>
                    <Accordion.Toggle as='button' className='bd' eventKey='0'>
                        Extras
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey='0'>
                        <main>
                            <div>
                                <label htmlFor={`info-${orderIndex}`}>Info</label>
                                <Editor
                                    defaultValue={info}
                                    name='info'
                                    id={`info-${orderIndex}`}
                                    onChange={this.handleInputChange}
                                />
                            </div>
                            <div>
                                <label htmlFor={`image-importance-${orderIndex}`}>Image Importance</label>
                                <select
                                    name='imageImportance'
                                    id={`image-importance-${orderIndex}`}
                                    defaultValue={imageImportance}
                                    onChange={this.handleInputChange}>
                                    <option value='default'>Default</option>
                                    <option value='preserveSizing'>Preserve Sizing</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor={`allowEnlargeImage-${orderIndex}`}>
                                    Show image enlarge option?&nbsp;&nbsp;&nbsp;
                                    <input
                                        type='checkbox'
                                        name='allowEnlargeImage'
                                        id={`allowEnlargeImage-${orderIndex}`}
                                        checked={allowEnlargeImage}
                                        onChange={this.handleCheckboxClick}
                                    />
                                </label>
                            </div>
                        </main>
                    </Accordion.Collapse>
                </Accordion>
            </>
        );
    }
}
