import React, { Component } from 'react';
import RadioAnswers from './RadioAnswers/RadioAnswers';

import './RadioQuestion.scss';

interface IProps {
    question?: any;
    questionNumber: number;
    handleAnswer: (answer: number, question: number) => void;
    selectedAnswer?: number;
    result?: Record<string, boolean>;
    correctAnswer?: number;
    questionIndex: number;
    readOnly: boolean;
}

export default class RadioQuestion extends Component<IProps> {
    render() {
        const { question, questionNumber, result, selectedAnswer, questionIndex, readOnly } = this.props;

        let questionClass = '';

        if (result) {
            if (result.correct) {
                questionClass = 'correct';
            } else {
                questionClass = 'incorrect';
            }
        }

        return (
            <div className='radio-question'>
                <p className={questionClass}>
                    {questionNumber}. {question.title}
                </p>
                <div>
                    {question.options.map((option: any, index: number) => {
                        return (
                            <RadioAnswers
                                key={index}
                                answerIndex={index}
                                title={question.title}
                                selectedAnswer={selectedAnswer}
                                option={option}
                                questionNumber={this.props.questionNumber}
                                handleAnswer={this.props.handleAnswer}
                                correctAnswer={this.props.correctAnswer === index ? true : false}
                                questionIndex={questionIndex}
                                readOnly={readOnly}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }
}
