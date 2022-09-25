import React from 'react';
import BaseCard from '../BaseCard';
import InputStack from '../../../../../../components/InputStack/InputStack';
import HorizontalListItem from './HorizontalListItem';
import Editor from '../../../../../../components/Editor';
import { Accordion } from 'react-bootstrap';
import ThemeOptions from '../ThemeOptions';

export default class HorizontalListCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
        horizontalListItems: this.props.horizontalListItems || [],
    };

    emptyHorizontalListItem = {
        image: '',
        content: '',
    };

    handleListChange = (horizontalListItems) => {
        this.setState(
            {
                horizontalListItems,
            },
            this.dispatchLessonChange
        );
    };

    render() {
        const {
            state: { heading, subHeading, content, info, horizontalListItems, theme },
            props: { orderIndex },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
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
                <InputStack
                    value={horizontalListItems}
                    emptyValue={this.emptyHorizontalListItem}
                    component={HorizontalListItem}
                    onChange={this.handleListChange}
                    limit={3}
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
