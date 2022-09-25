import React, { Component } from 'react';
import InputStack from '../../../../../../components/InputStack/InputStack';
import SingleQuestionForm from './SingleQuestionForm';
import Editor from '../../../../../../components/Editor';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class FillGapInputs extends Component {
    render() {
        return (
            <>
                <label htmlFor={`heading-${this.props.index}`}>Heading</label>
                <TextInput
                    type='text'
                    name='heading'
                    id={`heading-${this.props.index}`}
                    onChange={this.props.handleInputChange}
                    value={this.props.heading}
                />
                <label className='mt-3' htmlFor={`subheading-${this.props.index}`}>
                    Subheading
                </label>
                <TextInput
                    type='text'
                    name='subHeading'
                    id={`subheading-${this.props.index}`}
                    onChange={this.props.handleInputChange}
                    value={this.props.subHeading}
                />
                <div>
                    <label htmlFor={`content-${this.props.index}`}>Content</label>
                    <Editor
                        defaultValue={this.props.content}
                        name='content'
                        id={`content-${this.props.index}`}
                        onChange={this.props.handleInputChange}
                    />
                </div>
                <br />
                <h4 className='mt-3 mb-4'>Questions</h4>
                <InputStack
                    value={this.props.questions}
                    emptyValue={this.props.emptyQuestion}
                    component={SingleQuestionForm}
                    onChange={this.props.handleQuestionsChange}
                />
            </>
        );
    }
}

