import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import LessonContext from '../../../LessonContext';
import NextButton from './NextButton';
import PreviousButton from './PreviousButton';
import EventBus from 'src/helpers/eventBus';
import { StartExam } from 'src/pages/Course/Stages/Lessons/StartExam';

interface IRouteProps {
    lessonId: string;
}
export interface IProps {
    setActiveCardIndex: (e: number) => any;
    activeCardIndex: number;
    course: any;
    blockingCardIndex: number | null;
    cardType: string;
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;
class Navigation extends Component<TProps> {
    static contextType = LessonContext;

    get isFinalExamActive(): boolean {
        return this.context.cards.length - 1 === this.props.activeCardIndex;
    }

    nextLessonMiddleware = (canSitExam?: boolean) => {
        const cardsLength = this.context.cards.length,
            { activeCardIndex } = this.props;

        if (activeCardIndex !== cardsLength - 1) {
            this.props.setActiveCardIndex(activeCardIndex + 1);
            this.context?.setIsBlockedByNodes?.(false);

            return false;
        }
        this.context?.setIsBlockedByNodes?.(false);
        if (canSitExam) return false;
        else return true;
    };

    previousLessonMiddleWare = () => {
        const { activeCardIndex } = this.props;
        const cardsLength = this.context.cards.length;
        if (activeCardIndex !== 0) {
            this.props.setActiveCardIndex(activeCardIndex - 1);

            return false;
        }
        this.props.setActiveCardIndex(cardsLength - 1);

        return true;
    };
    handleClick = () => {
        EventBus.dispatch('check-answer-event');
    };
    handleExam = () => {
        const { course } = this.props,
            { nextLesson } = this.context;
        if (!nextLesson?._id) {
            if (course.passedAt) {
                EventBus.dispatch('enter-post-exam');
                return false;
            }

            EventBus.dispatch('enter-pre-exam');
            return false;
        }
    };

    render() {
        const { activeCardIndex, course, blockingCardIndex } = this.props,
            { previousLesson, feedback, nextLesson } = this.context;

        if (feedback.show) {
            return <></>;
        }

        return (
            <div className='slide-container__navigation'>
                <PreviousButton
                    lessonContext={this.context}
                    activeCardIndex={activeCardIndex}
                    visible={activeCardIndex !== 0 || previousLesson}
                    middleware={this.previousLessonMiddleWare}
                />
                {nextLesson && this.props.cardType === 'SINGLE_QUESTION' && (
                    <div className={`check-answer-container`}>
                        <button onClick={this.handleClick}>Check Answer</button>
                    </div>
                )}
                {!(nextLesson && nextLesson._id) && (
                    <StartExam
                        lessonContext={this.context}
                        isFinalExamActive={this.isFinalExamActive}
                        examBtnCls={'lesson-button'}
                    />
                )}
                <NextButton
                    lessonContext={this.context}
                    activeCardIndex={activeCardIndex}
                    middleware={this.nextLessonMiddleware}
                />
            </div>
        );
    }
}

export default withRouter(Navigation);
