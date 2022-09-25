import React from 'react';
import BaseCard from './BaseCard';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../components/Editor';
import { AsyncPreviewFileUpload } from '../../../../../components/FileUpload';
import TextInput from '../../../../../components/inputs/TextInput';

export default class AudioSampleCard extends BaseCard {
    state = {
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        sourceAudio: this.props.sourceAudio ?? '',
        info: this.props.info ?? '',
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
            state: { heading, subHeading, content, info, sourceAudio },
            props: { orderIndex },
        } = this;

        return (
            <>
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
                    <AsyncPreviewFileUpload
                        label='Upload audio'
                        type='audio'
                        id={`sourceAudio-${orderIndex}`}
                        name='sourceAudio'
                        file={sourceAudio}
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
                        </main>
                    </Accordion.Collapse>
                </Accordion>
            </>
        );
    }
}
