import React, { Component } from 'react';

interface IProps {
    title?: string;
    option?: string;
    handleAnswer: (answer: number, question: number) => void;
    questionNumber: number;
    answerIndex: number;
    selectedAnswer?: number;
    correctAnswer?: boolean;
    questionIndex: number;
    readOnly: boolean;
}

export default class RadioAnswers extends Component<IProps> {
    render() {
        const { option, title, answerIndex, selectedAnswer, correctAnswer, questionIndex, readOnly } = this.props;

        const checked = selectedAnswer === answerIndex;

        return (
            <div className={correctAnswer ? 'radio-correct' : ''}>
                {!readOnly || checked ? (
                    <input
                        type='radio'
                        name={title}
                        value={answerIndex}
                        id={`${questionIndex}-${answerIndex}`}
                        checked={checked}
                        onChange={(e) => {
                            if (!readOnly) this.props.handleAnswer(parseInt(e.target.value), this.props.questionNumber);
                        }}
                    />
                ) : (
                    <div className='empty-radio'></div>
                )}

                <label htmlFor={`${questionIndex}-${answerIndex}`}>
                    {option} <strong>{correctAnswer ? ' - Correct Answer' : ''}</strong>
                </label>
            </div>
        );
    }
}
