import React from 'react';
import BaseCard from './BaseCard';
import { AsyncPreviewFileUpload } from '../../../../../components/FileUpload';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../components/Editor';
import ThemeOptions from './ThemeOptions';
import TextInput from '../../../../../components/inputs/TextInput';

export default class DocumentCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        sourceDocument: this.props.sourceDocument ?? '',
        heading: this.props.heading ?? '',
        content: this.props.content ?? '',
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
            state: { sourceDocument, heading, content, theme, info },
            props: { orderIndex },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor={`heading-${orderIndex}`}>Heading</label>
                    <TextInput
                        type='text'
                        name='heading'
                        id={`heading-${orderIndex}`}
                        defaultValue={heading}
                        onChange={this.handleInputChange}
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
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload document'
                        type='document'
                        id={`sourceDocument-${orderIndex}`}
                        name='sourceDocument'
                        file={sourceDocument}
                        onChange={this.handleFileChange}
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
