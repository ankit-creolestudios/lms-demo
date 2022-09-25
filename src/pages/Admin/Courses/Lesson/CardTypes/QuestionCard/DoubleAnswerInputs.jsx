import React, { Component } from 'react';
import InputStack from '../../../../../../components/InputStack/InputStack';
import DoubleAnswerForm from './DoubleAnswerForm';
import Editor from '../../../../../../components/Editor';
import BaseCard from '../BaseCard';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class DoubleAnswerInputs extends BaseCard {
    render() {
        return (
            <>
                <div className='mt-2'>
                    <label htmlFor={`heading-${this.props.index}`}>Heading</label>
                    <TextInput
                        type='text'
                        name='heading'
                        id={`heading-${this.props.index}`}
                        onChange={this.props.handleInputChange}
                        value={this.props.heading}
                    />
                </div>
                <div className='mt-2'>
                    <label htmlFor={`subheading-${this.props.index}`}>Subheading</label>
                    <TextInput
                        type='text'
                        name='subHeading'
                        id={`subheading-${this.props.index}`}
                        onChange={this.props.handleInputChange}
                        value={this.props.subHeading}
                    />
                </div>
                <div className='mt-2'>
                    <label htmlFor={`content-${this.props.index}`}>Content</label>
                    <Editor
                        defaultValue={this.props.content}
                        name='content'
                        id={`content-${this.props.index}`}
                        onChange={this.props.handleInputChange}
                    />
                </div>
                <InputStack
                    value={this.props.questions}
                    emptyValue={this.props.emptyQuestion}
                    component={DoubleAnswerForm}
                    onChange={this.props.handleQuestionsChange}
                />
            </>
        );
    }
}