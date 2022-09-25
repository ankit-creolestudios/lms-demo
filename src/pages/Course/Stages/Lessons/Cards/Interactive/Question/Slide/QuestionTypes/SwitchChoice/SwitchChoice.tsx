import React, { Component } from 'react';
import './SwitchChoice.scss';
import { QuestionContext } from '../../QuestionContext';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface IProps {}
interface IState {
    fadeOutDirection: string;
    fadeOutIndex: number | null;
    fadeQuestionIndex?: number;
}
export default class SwitchChoice extends Component<IProps, IState> {
    static contextType = QuestionContext;

    state: IState = {
        fadeOutDirection: 'left',
        fadeOutIndex: null,
    };

    handleNextAnswer = (questionIndex: number, currentAnswer: number) => (e: any) => {
        const nextAnswer =
            this.context.questions[questionIndex].options.length - 1 === currentAnswer ? 0 : currentAnswer + 1;

        this.setState(
            {
                fadeOutIndex: currentAnswer,
                fadeOutDirection: 'right',
                fadeQuestionIndex: questionIndex,
            },
            () => {
                setTimeout(() => {
                    this.setState({
                        fadeOutIndex: null,
                    });
                }, 200);
            }
        );

        this.context.selectAnswer(questionIndex, e, nextAnswer);
    };

    handlePreviousAnswer = (questionIndex: number, currentAnswer: number) => (e: any) => {
        const nextAnswer =
            currentAnswer === 0 ? this.context.questions[questionIndex].options.length - 1 : currentAnswer - 1;

        this.setState(
            {
                fadeOutIndex: currentAnswer,
                fadeOutDirection: 'left',
                fadeQuestionIndex: questionIndex,
            },
            () => {
                setTimeout(() => {
                    this.setState({
                        fadeOutIndex: null,
                    });
                }, 200);
            }
        );

        this.context.selectAnswer(questionIndex, e, nextAnswer);
    };

    render() {
        const { heading, subHeading, content, questions, getSelectedOption } = this.context,
            { fadeOutDirection, fadeOutIndex, fadeQuestionIndex } = this.state;

        return (
            <>
                {(heading || subHeading) && (
                    <header>
                        {heading && <h1>{heading}</h1>}
                        {subHeading && <h3>{subHeading}</h3>}
                    </header>
                )}
                <div className='switch-choice'>
                    {content && <section dangerouslySetInnerHTML={{ __html: content }} />}
                    {Array.isArray(questions) &&
                        questions.map((question, questionIndex) => {
                            const currentAnswer = getSelectedOption(questionIndex);

                            return (
                                <div
                                    key={questionIndex}
                                    className={`question-block${
                                        this.context?.questionResults?.length
                                            ? `${
                                                  this.context?.questionResults[questionIndex]?.isUserAnswerCorrect
                                                      ? ' question-block--correct'
                                                      : ' question-block--wrong'
                                              }`
                                            : ''
                                    }`}
                                >
                                    <b className='question'>{question.question}</b>
                                    <div className='options'>
                                        <div
                                            className='previous'
                                            onClick={this.handlePreviousAnswer(questionIndex, currentAnswer)}
                                        >
                                            <Fa icon={faChevronLeft} />
                                        </div>
                                        <section>
                                            {question.options.map((option: any, optionIndex: number) => (
                                                <div
                                                    key={optionIndex}
                                                    className={`option${
                                                        currentAnswer === optionIndex ? ' option--active' : ''
                                                    }${
                                                        fadeOutIndex === optionIndex &&
                                                        fadeQuestionIndex === questionIndex
                                                            ? ` option--fadeout-${fadeOutDirection}`
                                                            : ''
                                                    }${
                                                        fadeOutIndex !== null &&
                                                        currentAnswer === optionIndex &&
                                                        fadeQuestionIndex === questionIndex
                                                            ? ` option--fadein-${fadeOutDirection}`
                                                            : ''
                                                    }`}
                                                >
                                                    <span>{option.text}</span>
                                                </div>
                                            ))}
                                        </section>
                                        <div
                                            className='after'
                                            onClick={this.handleNextAnswer(questionIndex, currentAnswer)}
                                        >
                                            <Fa icon={faChevronRight} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            </>
        );
    }
}
