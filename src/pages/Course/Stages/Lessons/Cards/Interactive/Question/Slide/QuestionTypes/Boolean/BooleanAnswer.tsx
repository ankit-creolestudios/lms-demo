import React, { Component } from 'react';
import { QuestionContext } from '../../QuestionContext';
import { withRouter, RouteComponentProps } from 'react-router';
import './BooleanAnswer.scss';

interface IProps {}
interface IRouteProps {}
export type TProps = IProps & RouteComponentProps<IRouteProps>;

class BooleanAnswer extends Component<TProps> {
    static contextType = QuestionContext;

    optionIndexes: Record<number, any> = {};

    //this function can be used to randomise the order the answers appear in
    //unused atm but could be useful in future
    getOptionIndex = (QuestionIndex: number, optionPosition: number) => {
        if (!this.optionIndexes[QuestionIndex]) {
            this.optionIndexes[QuestionIndex] = { 0: null, 1: null };
        }
        if (this.optionIndexes[QuestionIndex][optionPosition] !== null) {
            return this.optionIndexes[QuestionIndex][optionPosition];
        } else {
            if (this.optionIndexes[QuestionIndex][optionPosition ? 0 : 1] !== null) {
                return this.optionIndexes[QuestionIndex][optionPosition ? 0 : 1] ? 0 : 1;
            } else {
                const index = Math.random() >= 0.5 ? 1 : 0;
                this.optionIndexes[QuestionIndex][optionPosition] = index;
                return index;
            }
        }
    };

    getSelectedOptionIndex = (questionIndex: number) => {
        if (this.context.userAnswers[questionIndex]) {
            return this.context.userAnswers[questionIndex][0];
        }
    };

    render() {
        const { heading, subHeading } = this.context;
        return (
            <>
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                <div className='boolean-answers'>
                    {this.context.content && (
                        <div className='content' dangerouslySetInnerHTML={{ __html: this.context.content }} />
                    )}
                    <div className='questions'>
                        {this.context.questions.map((question: any, questionIndex: number) => {
                            return (
                                <div key={questionIndex} className='question'>
                                    <div
                                        className={`result ${
                                            this.context?.questionResults?.length
                                                ? this.context?.questionResults?.[questionIndex]?.isUserAnswerCorrect
                                                    ? 'correct'
                                                    : 'incorrect'
                                                : ''
                                        }`}
                                    >
                                        {this.context.getResultIcon(
                                            questionIndex,
                                            this.getSelectedOptionIndex(questionIndex)
                                        )}
                                    </div>
                                    <div className='content'>
                                        <span>{question.question}</span>
                                        <div className='options'>
                                            <button
                                                onClick={(e) => {
                                                    this.context.selectAnswer(questionIndex, e, 0);
                                                }}
                                                className={`option ${
                                                    this.context.isOptionSelected(questionIndex, 0) ? 'selected' : ''
                                                }`}
                                            >
                                                {question.options[0].text}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    this.context.selectAnswer(questionIndex, e, 1);
                                                }}
                                                className={`option ${
                                                    this.context.isOptionSelected(questionIndex, 1) ? 'selected' : ''
                                                }`}
                                            >
                                                {question.options[1].text}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </>
        );
    }
}

export default withRouter(BooleanAnswer);
