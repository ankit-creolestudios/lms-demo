import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter, RouteComponentProps } from 'react-router';
import { Interface } from 'readline';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper/ConditialWrapper';
import { Api, EventBus } from 'src/helpers/new';
import CourseContext from 'src/pages/Course/CourseContext';

interface IRouteProps {
    lessonId: string;
    courseId: string;
}
interface IProps {
    lessonContext: any;
    activeCardIndex?: number;
    middleware: (e?: boolean) => boolean;
}
interface IState {}
export type TProps = IProps & RouteComponentProps<IRouteProps>;
class NextButton extends Component<TProps, IState> {
    static contextType = CourseContext;

    get isLessonLocked(): boolean {
        return (
            this.props.lessonContext.cards.length - 1 === this.props.activeCardIndex &&
            !this.context.unlockedLessons.includes(this.props?.lessonContext?.nextLesson?._id)
        );
    }

    handleClick = () => {
        const { courseId } = this.props.match.params;
        const { nextLesson } = this.props.lessonContext;
        const proceedToNextLesson =
            typeof this.props.middleware === 'function' ? this.props.middleware(this.isLessonLocked) : true;

        if (!proceedToNextLesson) {
            return;
        }

        const { userChapterId: chapterId, _id: lessonId } = nextLesson;
        if (chapterId && lessonId) {
            EventBus.dispatch('change-lesson', {
                lessonId: lessonId,
                chapterId: chapterId,
            });
        }
    };

    startExam = () => {
        EventBus.dispatch('enter-pre-exam');
    };

    render() {
        const { children } = this.props,
            { nextLesson } = this.props.lessonContext;
        const isNextButtonAvaialble = this.props.lessonContext.cards.length - 1 === this.props.activeCardIndex;
        if (isNextButtonAvaialble && (!nextLesson || !nextLesson._id)) return <></>;
        return (
            <ConditionalWrapper
                condition={!nextLesson?._id && !!nextLesson}
                wrapper={(children: any) => (
                    <OverlayTrigger overlay={<Tooltip id={`tooltip-next-lesson`}>{'disabled'}</Tooltip>}>
                        {children}
                    </OverlayTrigger>
                )}
            >
                <div
                    className={`lesson-button lesson-button--next${
                        this.isLessonLocked ? ' lesson-button--disabled' : ''
                    }`}
                    onClick={this.handleClick}
                >
                    {children ? (
                        children
                    ) : (
                        <>
                            Next
                            <i className='fa-solid fa-chevron-right' />
                        </>
                    )}
                </div>
            </ConditionalWrapper>
        );
    }
}

export default withRouter(NextButton);
