import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import LessonContext from '../../../LessonContext';
import NextButton from './QuizNextButton';
import PreviousButton from './QuizPreviousButton';
import EventBus from 'src/helpers/eventBus';

interface IRouteProps {
    lessonId: string;
}
export interface IProps {
    setActiveCardIndex: (e: number) => any;
    handleSubmit: (e: any) => any;
    activeCardIndex: number;
    course: any;
    blockingCardIndex: number | null;
    cardType: string;
    questions: any[];
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;
class Navigation extends Component<TProps> {
    static contextType = LessonContext;

    nextLessonMiddleware = (canSitExam?: boolean) => {
        const cardsLength = this.props.questions.length,
            { activeCardIndex, course } = this.props,
            { nextLesson } = this.context;

        if (activeCardIndex !== cardsLength - 1) {
            this.props.setActiveCardIndex(activeCardIndex + 1);
            this.context?.setIsBlockedByNodes?.(false);

            return false;
        }

        if (!nextLesson?._id) {
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
        const { activeCardIndex } = this.props;
        const cardsLength = this.props.questions.length;
        if (activeCardIndex !== 0) {
            this.props.setActiveCardIndex(activeCardIndex - 1);

            return false;
        }
        this.props.setActiveCardIndex(cardsLength - 1);

        return true;
    };

    render() {
        const { activeCardIndex, course, blockingCardIndex } = this.props,
            { previousLesson, feedback } = this.context;

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
                {this.props.questions && this.props.questions.length - 1 === activeCardIndex && (
                    <div className={`check-answer-container`}>
                        <button onClick={this.props.handleSubmit}>Submit</button>
                    </div>
                )}
                {this.props.questions && this.props.questions.length - 1 !== activeCardIndex && (
                    <NextButton
                        lessonContext={this.context}
                        activeCardIndex={activeCardIndex}
                        visible={true}
                        middleware={this.nextLessonMiddleware}
                    />
                )}
            </div>
        );
    }
}

export default withRouter(Navigation);
