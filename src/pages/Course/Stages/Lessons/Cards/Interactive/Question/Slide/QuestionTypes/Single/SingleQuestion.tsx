import React, { Component } from 'react';
import { FileImage } from 'src/components/ApiFile';
import { QuestionContext } from '../../QuestionContext';
import { withRouter, RouteComponentProps } from 'react-router';
import './SingleQuestion.scss';
import Toggle from 'src/components/FormItems/Toggle';

interface IProps {}
interface IRouteProps {}
export type TProps = IProps & RouteComponentProps<IRouteProps>;

class SingleQuestion extends Component<TProps> {
    static contextType = QuestionContext;

    isImageQuestion = (questionIndex: number) => {
        return this.context.questions?.[questionIndex]?.options?.some?.((q: any) => q.image !== undefined);
    };

    getFileURL = () => {};

    render() {
        const { detailedQuestion, heading, subHeading } = this.context;

        return (
            <>
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
                <div className='single-question'>
                    <div className='questions'>
                        {this.context.questions.map((question: any, questionIndex: number) => {
                            return (
                                <div
                                    className={`question ${
                                        this.isImageQuestion(questionIndex) ? 'image-question' : ''
                                    }`}
                                    key={questionIndex}
                                >
                                    {!detailedQuestion && <span>{question.question}</span>}
                                    {question.options.map((option: any, optionIndex: string) => {
                                        return (
                                            <div
                                                className={`option${
                                                    this.context.isOptionSelectedAnswer(questionIndex, optionIndex) ||
                                                    (this.isImageQuestion(questionIndex) &&
                                                        this.context.isOptionSelected(questionIndex, optionIndex))
                                                        ? ' selected'
                                                        : ''
                                                }`}
                                                key={optionIndex}
                                            >
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
                                                        }`}
                                                    >
                                                        {this.context?.questionResults?.length ? (
                                                            this.context.getResultIcon(questionIndex, optionIndex)
                                                        ) : (
                                                            <Toggle
                                                                onChange={(e: any) => {
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
            </>
        );
    }
}

export default withRouter(SingleQuestion);
