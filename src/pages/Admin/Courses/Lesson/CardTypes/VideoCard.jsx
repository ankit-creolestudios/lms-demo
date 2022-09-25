import React from 'react';
import BaseCard from './BaseCard';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../components/Editor';
import ThemeOptions from './ThemeOptions';

export default class VideoCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        transcript: this.props.transcript ?? '',
        info: this.props.info ?? '',
        sourceVideo: this.props.sourceVideo ?? '',
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

    handleVideoIdPaste = async (e) => {
        const id =
            /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/gi.exec(
                (e.clipboardData || window.clipboardData).getData('text')
            );

        if (id && id[1]) {
            e.preventDefault();
            e.stopPropagation();

            this.props.handleInputChange({ target: { name: e.target.name, value: id[1] } });
        }
    };

    render() {
        const {
            state: { sourceVideo, transcript, info, theme },
            props: { orderIndex },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor={`sourceVideo-${orderIndex}`}>Vimeo ID</label>
                    <input
                        type='text'
                        name='sourceVideo'
                        id={`sourceVideo-${orderIndex}`}
                        value={sourceVideo}
                        onPaste={this.handleVideoIdPaste}
                        onChange={this.handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor={`transcript-${orderIndex}`}>Transcript</label>
                    <Editor
                        defaultValue={transcript}
                        name='transcript'
                        id={`transcript-${orderIndex}`}
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
