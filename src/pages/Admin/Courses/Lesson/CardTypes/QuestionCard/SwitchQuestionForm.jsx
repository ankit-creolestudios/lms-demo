import React, { Component } from 'react';
import Editor from '../../../../../../components/Editor';
import InputStack from '../../../../../../components/InputStack/InputStack';
import SingleQuestionForm from './SingleQuestionForm';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class SwitchQuestionForm extends Component {
    render() {
        const {
            index,
            heading,
            subHeading,
            content,
            handleInputChange,
            emptyQuestion,
            handleQuestionsChange,
            questions,
        } = this.props;

        return (
            <>
                <label htmlFor={`heading-${index}`}>Heading</label>
                <TextInput
                    type='text'
                    name='heading'
                    id={`heading-${index}`}
                    onChange={handleInputChange}
                    value={heading}
                />
                <label className='mt-3' htmlFor={`subheading-${index}`}>
                    Subheading
                </label>
                <TextInput
                    type='text'
                    name='subHeading'
                    id={`subheading-${index}`}
                    onChange={handleInputChange}
                    value={subHeading}
                />
                <div>
                    <label htmlFor={`content-${index}`}>Content</label>
                    <Editor
                        defaultValue={content}
                        name='content'
                        id={`content-${index}`}
                        onChange={handleInputChange}
                    />
                </div>
                <br />
                <h4 className='mt-3 mb-4'>Questions</h4>
                <InputStack
                    value={questions}
                    emptyValue={emptyQuestion}
                    component={SingleQuestionForm}
                    onChange={handleQuestionsChange}
                    hideImageOption
                />
            </>
        );
    }
}
