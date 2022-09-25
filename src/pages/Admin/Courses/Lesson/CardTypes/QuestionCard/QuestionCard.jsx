import React from 'react';
import BaseCard from '../BaseCard';
import InputStack from '../../../../../../components/InputStack/InputStack';
import SingleQuestionForm from './SingleQuestionForm';
import { Accordion } from 'react-bootstrap';
import Editor from '../../../../../../components/Editor';
import './QuestionCard.scss';
import QuestionCardContext from './QuestionCardContext';
import FillGapInputs from './FillGapInputs';
import DoubleAnswerInputs from './DoubleAnswerInputs';
import ThemeOptions from '../ThemeOptions';
import SwitchQuestionForm from './SwitchQuestionForm';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class QuestionCard extends BaseCard {
    state = {
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        questions: this.props.questions ?? [],
        questionType: this.props.questionType ?? 'SINGLE_QUESTION',
        nextCardAvailable: this.props.nextCardAvailable ?? 'AFTER_CORRECT',
        correctFeedback: this.props.correctFeedback ?? '',
        incorrectFeedback: this.props.incorrectFeedback ?? '',
        detailedQuestion: this.props.detailedQuestion ?? false,
        info: this.props.info ?? '',
    };

    getEmptyQuestion = (insertionIndex) => {
        const { questionType, questions } = this.state;

        let emptyQuestion = {
            question: '',
            options: [
                {
                    isAnswer: false,
                    text: '',
                    image: undefined,
                },
                {
                    isAnswer: false,
                    text: '',
                    image: undefined,
                },
                {
                    isAnswer: false,
                    text: '',
                    image: undefined,
                },
                {
                    isAnswer: false,
                    text: '',
                    image: undefined,
                },
            ],
            answer: [],
        };

        if (questionType !== 'SINGLE_QUESTION' && questions?.[insertionIndex - 1]?.options) {
            emptyQuestion.options = questions?.[insertionIndex - 1]?.options;
        }

        return emptyQuestion;
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

    handleQuestionsChange = (questions) => {
        this.setState(
            {
                questions,
            },
            this.dispatchLessonChange
        );
    };

    render() {
        let {
            props: { questions, orderIndex },
            state: {
                heading,
                subHeading,
                questionType,
                nextCardAvailable,
                correctFeedback,
                incorrectFeedback,
                detailedQuestion,
                content,
                theme,
                info,
            },
        } = this;

        return (
            <div className='question-card'>
                <div className='options'>
                    <div>
                        <label htmlFor={`questionType-${orderIndex}`}>Question type</label>
                        <select
                            name='questionType'
                            id={`questionType-${orderIndex}`}
                            value={questionType}
                            onChange={this.handleInputChange}>
                            <option value='SINGLE_QUESTION'>Multiple choice</option>
                            <option value='FILL_GAP'>Fill the gap</option>
                            <option value='SWITCH_CHOICE'>Choice switch</option>
                            <option value='DOUBLE_CHOICE'>Double choice</option>
                            {/* <option value='CATEGORISE'>Categorise</option>
                            <option value='IMAGE_SELECT'>Select the image</option> */}
                        </select>
                    </div>
                    <div>
                        <label htmlFor={`nextCardAvailable-${orderIndex}`}>Next Card Available</label>
                        <select
                            name='nextCardAvailable'
                            id={`nextCardAvailable-${orderIndex}`}
                            value={nextCardAvailable}
                            onChange={this.handleInputChange}>
                            <option value='ALWAYS'>Always</option>
                            <option value='AFTER_ANSWER'>After Answer</option>
                            <option value='AFTER_CORRECT'>After Correct</option>
                        </select>
                    </div>
                </div>
                <QuestionCardContext.Provider
                    value={{
                        questionType,
                    }}>
                    <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                    {this.state.questionType === 'SINGLE_QUESTION' && (
                        <>
                            <label htmlFor='detailedQuestion' className='mb-4'>
                                <input
                                    type='checkbox'
                                    checked={detailedQuestion}
                                    onChange={this.handleCheckboxClick}
                                    name='detailedQuestion'
                                    id={`detailedQuestion-${orderIndex}`}
                                />
                                &nbsp;No heading banner
                            </label>
                            {!detailedQuestion && (
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
                                </>
                            )}
                            <InputStack
                                value={questions}
                                emptyValue={this.getEmptyQuestion}
                                component={SingleQuestionForm}
                                onChange={this.handleQuestionsChange}
                                limit={1}
                            />
                        </>
                    )}
                    {this.state.questionType === 'FILL_GAP' && (
                        <FillGapInputs
                            heading={this.state.heading}
                            subHeading={this.state.subHeading}
                            content={this.state.content}
                            index={this.state.index}
                            questions={questions}
                            handleInputChange={this.handleInputChange}
                            handleQuestionsChange={this.handleQuestionsChange}
                            emptyQuestion={this.getEmptyQuestion}
                        />
                    )}
                    {this.state.questionType === 'SWITCH_CHOICE' && (
                        <SwitchQuestionForm
                            heading={this.state.heading}
                            subHeading={this.state.subHeading}
                            content={this.state.content}
                            index={this.state.index}
                            questions={questions}
                            handleInputChange={this.handleInputChange}
                            handleQuestionsChange={this.handleQuestionsChange}
                            emptyQuestion={this.getEmptyQuestion}
                        />
                    )}
                    {this.state.questionType === 'DOUBLE_CHOICE' && (
                        <DoubleAnswerInputs
                            heading={this.state.heading}
                            subHeading={this.state.subHeading}
                            content={this.state.content}
                            index={this.state.index}
                            questions={questions}
                            handleInputChange={this.handleInputChange}
                            handleQuestionsChange={this.handleQuestionsChange}
                            emptyQuestion={this.getEmptyQuestion}
                        />
                    )}
                    <Accordion as='footer' className='lesson-cards__item__extras'>
                        <Accordion.Toggle as='button' className='bd' eventKey='0'>
                            Extras
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey='0'>
                            <main>
                                <div>
                                    <label htmlFor={`correctFeedback-${orderIndex}`}>Correct Feedback</label>
                                    <Editor
                                        defaultValue={correctFeedback}
                                        name='correctFeedback'
                                        id={`correctFeedback-${orderIndex}`}
                                        onChange={this.handleInputChange}
                                    />
                                    <label htmlFor={`incorrectFeedback-${orderIndex}`}>Incorrect Feedback</label>
                                    <Editor
                                        defaultValue={incorrectFeedback}
                                        name='incorrectFeedback'
                                        id={`incorrectFeedback-${orderIndex}`}
                                        onChange={this.handleInputChange}
                                    />
                                </div>
                                <label htmlFor={`info-${orderIndex}`}>Info</label>
                                <Editor
                                    defaultValue={info}
                                    name='info'
                                    id={`info-${orderIndex}`}
                                    onChange={this.handleInputChange}
                                />
                            </main>
                        </Accordion.Collapse>
                    </Accordion>
                </QuestionCardContext.Provider>
            </div>
        );
    }
}
