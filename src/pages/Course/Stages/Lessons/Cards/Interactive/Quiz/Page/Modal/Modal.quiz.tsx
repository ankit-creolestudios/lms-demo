import React, { Component } from 'react';
import { EndOfChapterQuiz } from 'src/pages/Courses/CardTypes';
import { QuestionsModal } from 'src/pages/Courses/QuestionsModal';
import { IQuiz } from '../Quiz.page';

interface IProps {
    quiz: IQuiz;
    cardId: string;
}

export default class ModalQuiz extends Component<IProps> {
    render() {
        const { quiz, cardId } = this.props;
        return <EndOfChapterQuiz quizId={quiz._id} cardId={cardId} />;
    }
}
