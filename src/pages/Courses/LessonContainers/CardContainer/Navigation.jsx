import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { LessonContext } from '../../LessonContext';
import NextButton from '../NextButton';
import PreviousButton from '../PreviousButton';

class Navigation extends Component {
    static contextType = LessonContext;

    handleCardChange = (e) => {
        const { isInQuiz = false } = this.context.cardsQuiz;
        if (isInQuiz) {
            this.context.setCardsQuizState({
                questionIndex: parseInt(e.target.value),
            });
        } else {
            this.props.setActiveCardIndex(parseInt(e.target.value));
        }
    };

    nextLessonMiddleware = (canSitExam) => {
        const cardsLength = this.context.cards.length,
            { activeCardIndex, course } = this.props,
            { nextLesson, isAdminPreview } = this.context,
            {
                isInQuiz = false,
                questionsLength = 0,
                questionIndex = 0,
                allowSkip,
                answers,
            } = this.context.cardsQuiz ?? {};

        if (isInQuiz) {
            if (
                questionIndex !== questionsLength - 1 &&
                (allowSkip || (!allowSkip && typeof answers[questionIndex] === 'number'))
            ) {
                this.context.setCardsQuizState({
                    questionIndex: questionIndex + 1,
                    currentAnswer: undefined,
                });
            }

            if (questionIndex === questionsLength - 1) {
                this.context.cardsQuiz.onSubmit();
                this.context.setCardsQuizState({ isInQuiz: false });
            }

            return false;
        }

        if (activeCardIndex !== cardsLength - 1) {
            this.props.setActiveCardIndex(activeCardIndex + 1);
            this.context?.setIsBlockedByNodes?.(false);

            return false;
        }

        if (!nextLesson?._id && !isAdminPreview) {
            if (canSitExam) {
                this.props.history.push(`/courses/${course._id}/preexam`);

                return false;
            }

            if (course.passedAt) {
                this.props.history.push(`/courses/${course._id}/postexam`);

                return false;
            }
        }

        this.context?.setIsBlockedByNodes?.(false);
        return true;
    };

    previousLessonMiddleWare = () => {
        const { activeCardIndex } = this.props,
            { isInQuiz = false, questionIndex = 0 } = this.context.cardsQuiz ?? {};

        if (isInQuiz) {
            if (questionIndex !== 0) {
                this.context.setCardsQuizState({
                    questionIndex: questionIndex - 1,
                });
            }

            return false;
        }

        if (activeCardIndex !== 0) {
            this.props.setActiveCardIndex(activeCardIndex - 1);

            return false;
        }

        return true;
    };

    render() {
        const cardsLength = this.context.cards.length,
            { activeCardIndex, course, blockingCardIndex } = this.props,
            { previousLesson, feedback } = this.context,
            { isInQuiz = false, questionsLength = 0, questionIndex = 0, answers } = this.context.cardsQuiz ?? {};

        if (feedback.show) {
            return <></>;
        }

        return (
            <div className='card-container__navigation'>
                <PreviousButton
                    lessonContext={this.context}
                    activeCardIndex={activeCardIndex}
                    visible={activeCardIndex !== 0}
                    middleware={this.previousLessonMiddleWare}
                />
                <select
                    name='page'
                    id='page'
                    value={isInQuiz ? questionIndex : activeCardIndex}
                    onChange={this.handleCardChange}
                >
                    {Array.from({ length: !isInQuiz ? cardsLength : questionsLength }, (_, page) => (
                        <option
                            key={page}
                            value={page}
                            disabled={
                                (!isInQuiz && blockingCardIndex !== -1 && page > blockingCardIndex) ||
                                (isInQuiz && [undefined, null].includes(answers?.[page]))
                            }
                        >
                            {page + 1}
                        </option>
                    ))}
                </select>
                &nbsp;| {!isInQuiz ? cardsLength : questionsLength}
                <NextButton
                    answerInc={this.context?.cardsQuiz?.answerInc}
                    lessonContext={this.context}
                    activeCardIndex={activeCardIndex}
                    visible={true}
                    middleware={this.nextLessonMiddleware}
                />
            </div>
        );
    }
}

export default withRouter(Navigation);
