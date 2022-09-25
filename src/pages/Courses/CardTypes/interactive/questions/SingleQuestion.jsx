import React, { Component } from 'react';
import { FileImage } from '../../../../../components/ApiFile';
import { QuestionContext } from './QuestionContext';
import { withRouter } from 'react-router';
import './SingleQuestion.scss';
import Toggle from '../../../../../components/FormItems/Toggle';

class SingleQuestion extends Component {
    static contextType = QuestionContext;

    isImageQuestion = (questionIndex) => {
        return this.context.questions?.[questionIndex]?.options?.some?.((q) => q.image !== undefined);
    };

    getFileURL = () => {};

    render() {
        const { detailedQuestion, heading, subHeading } = this.context;

        return (
            <div className='single-question-card-component'>
                {!detailedQuestion ? (
                    <header>
                        {heading && <h1>{heading}</h1>}
                        {subHeading && <h3>{subHeading}</h3>}
                    </header>
                ) : (
                    <header>
                        <h1>{this.context?.questions?.[0]?.question}</h1>
                    </header>
                )}
                <div>
                    <div className='questions'>
                        {this.context.questions.map((question, questionIndex) => {
                            return (
                                <div
                                    className={`question ${
                                        this.isImageQuestion(questionIndex) ? 'image-question' : ''
                                    }`}
                                    key={questionIndex}>
                                    {!detailedQuestion && <span>{question.question}</span>}
                                    {question.options.map((option, optionIndex) => {
                                        return (
                                            <div
                                                className={`option${
                                                    this.context.isOptionSelectedAnswer(questionIndex, optionIndex) ||
                                                    (this.isImageQuestion(questionIndex) &&
                                                        this.context.isOptionSelected(questionIndex, optionIndex))
                                                        ? ' selected'
                                                        : ''
                                                }`}
                                                key={optionIndex}>
                                                {!this.isImageQuestion(questionIndex) && (
                                                    <div
                                                        className={`left-container ${
                                                            this.context.isOptionSelectedAnswer(
                                                                questionIndex,
                                                                optionIndex
                                                            )
                                                                ? this.context.isSelectedCorrect(
                                                                      questionIndex,
                                                                      optionIndex
                                                                  )
                                                                : ''
                                                        }`}>
                                                        {this.context?.questionResults?.length ? (
                                                            this.context.getResultIcon(questionIndex, optionIndex)
                                                        ) : (
                                                            <Toggle
                                                                onChange={(e) => {
                                                                    this.context.selectAnswer(questionIndex, e);
                                                                }}
                                                                type={
                                                                    question.answer.length === 1 ? 'radio' : 'checkbox'
                                                                }
                                                                id={optionIndex}
                                                                name={
                                                                    question.answer.length === 1
                                                                        ? `${questionIndex}`
                                                                        : `${questionIndex}-${optionIndex}`
                                                                }
                                                                value={optionIndex}
                                                                checked={this.context.isOptionSelected(
                                                                    questionIndex,
                                                                    optionIndex
                                                                )}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                                {this.isImageQuestion(questionIndex) && option.image && (
                                                    // maybe have an icon or something, that overlays the image?
                                                    // unable to style until the images are mixed
                                                    <FileImage
                                                        className='file-image'
                                                        onClick={() => {
                                                            this.context.selectAnswer(questionIndex, null, optionIndex);
                                                        }}
                                                        fileId={option.image}
                                                    />
                                                )}
                                                <label htmlFor={optionIndex}>{option.text}</label>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(SingleQuestion);
