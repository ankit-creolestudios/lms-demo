import React, { Component } from 'react';
import Editor from '../../../../../../components/Editor';
import BaseCard from '../BaseCard';
import { Accordion } from 'react-bootstrap';
import InputStack from '../../../../../../components/InputStack/InputStack';
import HotspotListItem from './HotspotListItem';
import ThemeOptions from '../ThemeOptions';

export default class HotspotListCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        direction: this.props.direction ?? 'vertical',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
        imageTextList: this.props.imageTextList ?? [],
        allowSkipNodes: this.props.allowSkipNodes ?? false,
    };

    emptyHotspotListItem = {
        image: '',
        content: '',
        title: '',
    };

    handleListChange = (imageTextList) => {
        this.setState(
            {
                imageTextList,
            },
            this.dispatchLessonChange
        );
    };

    render() {
        const {
            state: { heading, subHeading, content, info, imageTextList, theme, direction, allowSkipNodes },
            props: { orderIndex },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor={`direction-${orderIndex}`}>List Direction</label>
                    <select
                        name='direction'
                        id={`direction-${orderIndex}`}
                        onChange={this.handleInputChange}
                        defaultValue={direction}>
                        <option value='vertical'>Vertical</option>
                        <option value='horizontal'>Horizontal</option>
                    </select>
                </div>
                <div>
                    <label htmlFor={`heading-${orderIndex}`}>Heading</label>
                    <input
                        type='text'
                        name='heading'
                        id={`heading-${orderIndex}`}
                        defaultValue={heading}
                        onChange={this.handleInputChange}
                    />
                </div>
                <div>
                    <label htmlFor={`subHeading-${orderIndex}`}>Subheading</label>
                    <input
                        type='text'
                        name='subHeading'
                        id={`subHeading-${orderIndex}`}
                        defaultValue={subHeading}
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
                    <label htmlFor={`allowSkipNodes-${orderIndex}`}>
                        Allow students to progress without viewing all the nodes?&nbsp;&nbsp;&nbsp;
                        <input
                            type='checkbox'
                            name='allowSkipNodes'
                            id={`allowSkipNodes-${orderIndex}`}
                            checked={allowSkipNodes}
                            onChange={this.handleCheckboxClick}
                        />
                    </label>
                </div>
                <InputStack
                    value={imageTextList}
                    emptyValue={this.emptyHotspotListItem}
                    component={HotspotListItem}
                    onChange={this.handleListChange}
                    orderIndex={orderIndex}
                />
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
