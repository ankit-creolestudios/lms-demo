import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter, RouteComponentProps } from 'react-router';
import { Interface } from 'readline';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper/ConditialWrapper';
import { Api, EventBus } from 'src/helpers/new';

interface IRouteProps {
    lessonId: string;
    courseId: string;
}
interface IProps {
    lessonContext: any;
    activeCardIndex?: number;
    visible: boolean;
    middleware: (e?: boolean) => boolean;
}
interface IState {
    disabled: string;
    canSitExam: boolean;
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;
class NextButton extends Component<TProps, IState> {
    state = {
        disabled: '',
        canSitExam: false,
    };

    componentDidMount() {
        EventBus.on('disable-button', this.disableButton as any);
    }

    disableButton = async (event: Event) => {
        const { disabled } = (event as CustomEvent).detail;
        this.setState({
            disabled: disabled,
        });
    };

    handleClick = () => {
        const { courseId } = this.props.match.params;
        const { nextLesson } = this.props.lessonContext;
        if (this.state.disabled) return;
        // if (!nextLesson?.id) {
        //     this.props.history.push(`/courses/${courseId}/preexam`);
        //     return;
        // }
        const proceedToNextLesson =
            typeof this.props.middleware === 'function' ? this.props.middleware(this.state.canSitExam) : true;

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

    render() {
        const { visible, children } = this.props,
            { disabled } = this.state,
            { nextLesson } = this.props.lessonContext;

        return (
            <ConditionalWrapper
                condition={(!!disabled || !nextLesson?.unlocked) && !!nextLesson}
                wrapper={(children: any) => (
                    <OverlayTrigger overlay={<Tooltip id={`tooltip-next-lesson`}>{disabled}</Tooltip>}>
                        {children}
                    </OverlayTrigger>
                )}
            >
                <div
                    className={`lesson-button lesson-button--next${!visible ? ' lesson-button--hidden' : ''}${
                        (!!disabled || !nextLesson?.unlocked) && !!nextLesson ? ' lesson-button--disabled' : ''
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
