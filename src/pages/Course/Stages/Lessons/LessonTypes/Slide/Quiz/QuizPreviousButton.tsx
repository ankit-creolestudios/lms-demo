import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { EventBus } from 'src/helpers/new';

interface IProps {
    lessonContext: any;
    activeCardIndex: number;
    visible: boolean;
    middleware: (e?: boolean) => boolean;
}
interface IRouteProps {
    courseId: any;
}
interface IState {
    disabled: string;
}
export type TProps = IProps & RouteComponentProps<IRouteProps>;

class PreviousButton extends Component<TProps, IState> {
    state = {
        disabled: '',
    };

    handleClick = () => {
        if (!!this.state.disabled) {
            return;
        }
        const proceedToPreviousLesson = typeof this.props.middleware === 'function' ? this.props.middleware() : true;

        if (!proceedToPreviousLesson) {
            return;
        }

        const { courseId } = this.props.match.params,
            { userChapterId: chapterId, _id: lessonId } = this.props.lessonContext.previousLesson;

        EventBus.dispatch('change-lesson', {
            lessonId: lessonId + '/last',
            chapterId: chapterId,
        });
    };

    render() {
        const { visible } = this.props,
            { disabled } = this.state;

        return (
            <div
                className={`lesson-button lesson-button--previous${!visible ? ' lesson-button--hidden' : ''}${
                    !!disabled ? ' lesson-button--disabled' : ''
                }`}
                onClick={this.handleClick}
            >
                <i className='fa-solid fa-chevron-left' />
                Previous
            </div>
        );
    }
}

export default withRouter(PreviousButton);
