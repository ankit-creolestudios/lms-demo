import React, { Component } from 'react';
import './FillGapQuestion.scss';

interface IProps {
    question?: any;
    questionNumber: number;
    handleAnswer: (answer: number, question: number) => void;
    selectedAnswer?: number;
    result?: Record<string, boolean>;
    readOnly: boolean;
}

export default class FillGapQuestion extends Component<IProps> {
    render() {
        const { question, handleAnswer, questionNumber, result, selectedAnswer, readOnly } = this.props;

        let questionClass = '';

        if (result) {
            if (result.correct) {
                questionClass = 'correct';
            } else {
                questionClass = 'incorrect';
            }
        }

        const components = question.title.split('___').reduce((arr: [any], el: any, index: number) => {
            if (index === 0 && questionNumber) {
                arr.push(`${questionNumber}. `);
            }

            arr.push(<React.Fragment key={`question-part-${index}`}>{el}</React.Fragment>);

            if (index === 0) {
                if (readOnly) {
                    arr.push(
                        <span className='select-answer' key={index}>
                            {typeof selectedAnswer === 'number' ? question.options[selectedAnswer] : '_____'}
                        </span>
                    );
                } else {
                    arr.push(
                        <select
                            key={'question-select'}
                            onChange={(e) => {
                                handleAnswer(parseInt(e.target.value), questionNumber);
                            }}
                            value={selectedAnswer ?? -1}
                        >
                            <option value={-1}></option>
                            {question.options.map((option: any, index: number) => (
                                <option key={index} value={index}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    );
                }
            }

            return arr;
        }, []);

        return <div className={`fill-gap-question ${questionClass}`}>{components}</div>;
    }
}
