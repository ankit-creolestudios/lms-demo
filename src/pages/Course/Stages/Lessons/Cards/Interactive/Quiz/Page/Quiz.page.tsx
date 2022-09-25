import React, { Component } from 'react';
import InlineQuiz from './Inline/Inline.quiz';
import ModalQuiz from './Modal/Modal.quiz';

export interface IQuiz {
    _id: string;
    questions: any[];
    title: string;
    allowReattempt: string;
    revealAnswers: string;
}

export interface IProps {
    theme?: string;
    quizType?: string;
    quiz: IQuiz;
    cardId: string;
    quizAttempts: any[];
    quizPassed: boolean;
    lastAttempt: any;
}

export default class QuizPage extends Component<IProps> {
    render() {
        if (this.props.quizType === 'modal') {
            return <ModalQuiz {...this.props} />;
        } else {
            return <InlineQuiz {...this.props} />;
        }
    }
}
