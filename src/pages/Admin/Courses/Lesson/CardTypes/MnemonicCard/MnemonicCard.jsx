import React, { Component } from 'react';
import ThemeOptions from '../ThemeOptions';
import Editor from '../../../../../../components/Editor';
import { Accordion } from 'react-bootstrap';
import InputStack from '../../../../../../components/InputStack/InputStack';
import MnemonicRow from './MnemonicRow';
import './MnemonicCard.scss';
import BaseCard from '../BaseCard';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class MnemonicCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
        mnemonicList: this.props.mnemonicList ?? [],
        allowSkipNodes: this.props.allowSkipNodes ?? false,
    };

    emptyMnemonicRow = [];

    handleMnemonicListChange = (mnemonicList) => {
        this.setState(
            {
                mnemonicList,
            },
            this.dispatchLessonChange
        );
    };

    render() {
        const { theme, heading, subHeading, content, info, mnemonicList, allowSkipNodes } = this.state,
            { orderIndex } = this.props;

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
                <div>
                    <label htmlFor={`mnemonicList-${orderIndex}`}>Mnemonic rows</label>
                    <InputStack
                        value={mnemonicList}
                        emptyValue={this.emptyMnemonicRow}
                        component={MnemonicRow}
                        onChange={this.handleMnemonicListChange}
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