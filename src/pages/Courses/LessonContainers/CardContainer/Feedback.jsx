import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import EventBus from '../../../../helpers/eventBus';
import { LessonContext } from '../../LessonContext';
import NextButton from '../NextButton';
import './Feedback.scss';

class Feedback extends Component {
    static contextType = LessonContext;

    nextLessonMiddleware = () => {
        const cardsLength = this.context.cards.length,
            { activeCardIndex, course } = this.props,
            { nextLesson } = this.context,
            { nextCardAvailable, correct } = this.context.feedback;

        if (nextCardAvailable === 'AFTER_CORRECT' && !correct) {
            EventBus.dispatch('base-question-card-retry');
            return false;
        }

        if (!nextLesson?._id) {
            if (!course.preExamUpdatedAt) {
                this.props.history.push(`/courses/${course._id}/preexam`);

                return false;
            }

            if (course.passedAt) {
                this.props.history.push(`/courses/${course._id}/postexam`);

                return false;
            }
        }

        if (activeCardIndex !== cardsLength - 1) {
            this.props.setActiveCardIndex(activeCardIndex + 1);

            return false;
        }

        return true;
    };

    handleToggleClick = () => {
        this.context.setFeedback({
            expanded: !this.context.feedback.expanded,
        });
    };

    render() {
        const { show, expanded, correct, nextCardAvailable, content, title } = this.context.feedback;

        if (!show) {
            return <></>;
        }

        return (
            <div
                className={`card-container__feedback${correct ? ' card-container__feedback--correct' : ''}${
                    show ? ' card-container__feedback--visible' : ''
                }${expanded && content ? ' card-container__feedback--expanded' : ''}`}>
                <div className='card-container__feedback__header'>
                    <h1>{title}</h1>
                    <NextButton middleware={this.nextLessonMiddleware} lessonContext={this.context} visible>
                        {nextCardAvailable === 'AFTER_CORRECT' && !correct ? 'Retry' : 'Next'}
                    </NextButton>
                </div>
                {content && (
                    <div className='card-container__feedback__content'>
                        <div className='card-container__feedback__toggle' onClick={this.handleToggleClick}>
                            <Fa icon={!expanded ? faChevronUp : faChevronDown} />
                        </div>
                        <main dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(Feedback);
