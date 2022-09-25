import React, { Component } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import LessonCard from '../LessonCard';
import LessonCountdown from '../LessonCountdown';
import { Link, withRouter } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import LessonLayout from '../../../layouts/Lesson';
import { CourseContext } from '../CourseContext';
import NextButton from './NextButton';
import './PageContainer.scss';
import { LessonContext } from '../LessonContext';
import PreviousButton from './PreviousButton';
import MenuToggle from '../MenuToggle';

class PageContainer extends Component {
    static contextType = CourseContext;

    nextLessonMiddleware = () => {
        const { data: course } = this.context,
            { nextLesson } = this.props.lesson;

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

        return true;
    };

    render() {
        const { chapter, lesson } = this.props,
            { data: course, animateMenu, isMenuOpen } = this.context;

        return (
            <LessonLayout
                className={`lesson-page${animateMenu ? ' lesson-page--animate' : ''}${
                    isMenuOpen ? ' lesson-page--menu-open' : ''
                }`}>
                <nav className='lesson-page__breadcrumb'>
                    <span>{chapter.title}</span>
                    <Fa icon={faChevronRight} />
                    <span>{lesson.title}</span>
                </nav>
                <div className='lesson-page__content'>
                    {lesson.lessonType && lesson.lessonType !== 'BASIC' && (
                        <div className={`lesson-status lesson-status--${lesson.lessonType?.toLowerCase()}`}>
                            <span>{lesson.lessonType?.toLowerCase()}</span>
                        </div>
                    )}
                    {lesson.cards.map((card) => (
                        <LessonCard key={card._id} {...card} lessonLayout='page' />
                    ))}
                </div>
                <LessonContext.Consumer>
                    {(lessonContext) => (
                        <footer className='lesson-page__footer'>
                            <div>
                                <MenuToggle />
                                <PreviousButton
                                    lessonContext={lessonContext}
                                    visible={!!lessonContext?.previousLesson}
                                />
                                <div>
                                    <LessonCountdown lesson={lesson} />
                                </div>
                                <NextButton
                                    lessonContext={lessonContext}
                                    visible={true}
                                    middleware={this.nextLessonMiddleware}
                                />
                            </div>
                        </footer>
                    )}
                </LessonContext.Consumer>
            </LessonLayout>
        );
    }
}

export default withRouter(PageContainer);
