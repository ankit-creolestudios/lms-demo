import React, { Component } from 'react';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import LessonCard from '../../../Courses/LessonCard';
import './PagePreview.scss';

export default class PagePreview extends Component {
    render() {
        const {
            props: { chapter, lesson, cards },
        } = this;
        return (
            <div className='lesson-preview__page'>
                <nav className='lesson-preview__page__breadcrumb'>
                    <span>{chapter.title}</span>
                    <Fa icon={faChevronRight} />
                    <span>{lesson.title}</span>
                </nav>
                <div className='lesson-preview__page__content'>
                    {lesson.lessonType && lesson.lessonType !== 'BASIC' && (
                        <div className={`lesson-status lesson-status--${lesson.lessonType?.toLowerCase()}`}>
                            <span>{lesson.lessonType?.toLowerCase()}</span>
                        </div>
                    )}
                    {cards.map((card) => (
                        <LessonCard key={card._id} {...card} type='page' />
                    ))}
                </div>
            </div>
        );
    }
}
