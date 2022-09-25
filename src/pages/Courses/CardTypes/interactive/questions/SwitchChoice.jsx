import React, { Component } from 'react';
import './SwitchChoice.scss';
import { QuestionContext } from './QuestionContext';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default class SwitchChoice extends Component {
    static contextType = QuestionContext;

    state = {
        fadeOutDirection: 'left',
        fadeOutIndex: null,
    };

    handleNextAnswer = (questionIndex, currentAnswer) => (e) => {
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

    handlePreviousAnswer = (questionIndex, currentAnswer) => (e) => {
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
            <div className='switch-choice'>
                {(heading || subHeading) && (
                    <header>
                        {heading && <h1>{heading}</h1>}
                        {subHeading && <h3>{subHeading}</h3>}
                    </header>
                )}
                {content && <section dangerouslySetInnerHTML={{ __html: content }} />}
                {Array.isArray(questions) &&
                    questions.map((question, questionIndex) => {
                        const currentAnswer = getSelectedOption(questionIndex);

                        return (
                            <div
                                key={questionIndex}
                                className={`switch-choice__question-block${
                                    this.context?.questionResults?.length
                                        ? `${
                                              this.context?.questionResults[questionIndex]?.isUserAnswerCorrect
                                                  ? ' switch-choice__question-block--correct'
                                                  : ' switch-choice__question-block--wrong'
                                          }`
                                        : ''
                                }`}>
                                <b className='switch-choice__question'>{question.question}</b>
                                <div className='switch-choice__options'>
                                    <div
                                        className='switch-choice__previous'
                                        onClick={this.handlePreviousAnswer(questionIndex, currentAnswer)}>
                                        <Fa icon={faChevronLeft} />
                                    </div>
                                    <section>
                                        {question.options.map((option, optionIndex) => (
                                            <div
                                                key={optionIndex}
                                                className={`switch-choice__option${
                                                    currentAnswer === optionIndex
                                                        ? ' switch-choice__option--active'
                                                        : ''
                                                }${
                                                    fadeOutIndex === optionIndex && fadeQuestionIndex === questionIndex
                                                        ? ` switch-choice__option--fadeout-${fadeOutDirection}`
                                                        : ''
                                                }${
                                                    fadeOutIndex !== null &&
                                                    currentAnswer === optionIndex &&
                                                    fadeQuestionIndex === questionIndex
                                                        ? ` switch-choice__option--fadein-${fadeOutDirection}`
                                                        : ''
                                                }`}>
                                                <span>{option.text}</span>
                                            </div>
                                        ))}
                                    </section>
                                    <div
                                        className='switch-choice__after'
                                        onClick={this.handleNextAnswer(questionIndex, currentAnswer)}>
                                        <Fa icon={faChevronRight} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>
        );
    }
}
