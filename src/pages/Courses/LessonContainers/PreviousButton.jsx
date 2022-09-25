import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { withRouter } from 'react-router';

class PreviousButton extends Component {
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

        this.props.history.push(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/last`);
    };

    render() {
        const { visible } = this.props,
            { disabled } = this.state;

        return (
            <div
                className={`lesson-button lesson-button--previous${!visible ? ' lesson-button--hidden' : ''}${
                    !!disabled ? ' lesson-button--disabled' : ''
                }`}
                onClick={this.handleClick}>
                <Fa icon={faChevronLeft} />
                Previous
            </div>
        );
    }
}

export default withRouter(PreviousButton);
