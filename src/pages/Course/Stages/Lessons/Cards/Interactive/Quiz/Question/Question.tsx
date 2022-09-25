import React, { Component } from 'react';
import FillGapQuestion from './FillGapQuestion/FillGapQuestion';
import RadioQuestion from './RadioQuestion/RadioQuestion';
import './Question.scss';
interface IProps {
    question?: any;
    questionNumber: number;
    handleAnswer: (answer: number, question: number) => void;
    selectedAnswer?: number;
    result?: Record<string, boolean>;
    answer?: number | undefined;
    questionIndex: number;
    readOnly: boolean;
}

export default class Question extends Component<IProps> {
    render() {
        const { question, questionNumber, result, answer, questionIndex, selectedAnswer, readOnly } = this.props;

        let messageClass = '';
        let message = '';
        let answerMessage = '';

        if (result) {
            if (result.correct) {
                messageClass = 'question-message--correct';
                message = question.msgIfCorrect ?? '';
            } else {
                messageClass = 'question-message--wrong';
                message = selectedAnswer ? question.msgIfWrong ?? '' : 'Unanswered';
                if (answer !== undefined) {
                    answerMessage = ` The correct answer was ${question.options[answer]}.`;
                }
            }
        }

        return (
            <>
                <div className='question'>
                    {question.title.includes('___') ? (
                        <FillGapQuestion
                            questionNumber={questionNumber}
                            handleAnswer={this.props.handleAnswer}
                            question={question}
                            result={result}
                            selectedAnswer={selectedAnswer}
                            readOnly={readOnly}
                        />
                    ) : (
                        <RadioQuestion
                            questionNumber={questionNumber}
                            handleAnswer={this.props.handleAnswer}
                            question={question}
                            selectedAnswer={selectedAnswer}
                            result={result}
                            correctAnswer={answer}
                            questionIndex={questionIndex}
                            readOnly={readOnly}
                        />
                    )}
                </div>
                {result && (
                    <div className={`question-message ${messageClass}`}>
                        <h3>{result?.correct ? 'Correct Answer' : 'Wrong Answer'}</h3>
                        <p>
                            {message} {answerMessage}
                        </p>
                    </div>
                )}
            </>
        );
    }
}
