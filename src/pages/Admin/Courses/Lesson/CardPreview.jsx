import React, { Component } from 'react';
import LessonCard from '../../../Courses/LessonCard';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import './CardPreview.scss';

export default class CardPreview extends Component {
    state = {
        page: 0,
    };

    setCurrentLessonCard = async (page) => {
        if (page < 0 || page >= this.props.cards.length) {
            return;
        }
        this.setState({ page });
    };

    pageOptions = () => {
        let options = [];

        for (let i = 1; i <= this.props.cards.length; i++) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }

        return options;
    };

    render() {
        const {
                state: { page },
                props: { course, chapter, lesson, cards },
            } = this,
            currentCard = cards[page];

        return (
            <div className='lesson-preview__cards'>
                <h3>{course.title}</h3>
                <span>
                    <span>{chapter.title}</span>
                    <span> | </span>
                    <span>{lesson.title}</span>
                </span>
                <div className='lesson-preview__container'>
                    {lesson.lessonType && lesson.lessonType !== 'BASIC' && (
                        <span className={`lesson-status lesson-status--${lesson.lessonType?.toLowerCase()}`}>
                            <span>{lesson.lessonType?.toLowerCase()}</span>
                        </span>
                    )}
                    <LessonCard {...currentCard} type='card' />
                    <footer className='lesson-preview__controls'>
                        {!!page && (
                            <span
                                onClick={() => {
                                    this.setCurrentLessonCard(page - 1);
                                }}>
                                <AiOutlineLeft /> Previous
                            </span>
                        )}
                        <div>
                            <select
                                style={{
                                    width: `${cards.length.toString().length + 1.5}ch`,
                                }}
                                type='number'
                                name='page'
                                id='page'
                                value={parseInt(page) + 1}
                                onChange={(e) => {
                                    this.setCurrentLessonCard(parseInt(e.target.value) - 1);
                                }}>
                                {this.pageOptions()}
                            </select>
                            <div> | {cards.length}</div>
                        </div>
                        {page < cards.length - 1 && (
                            <span
                                onClick={() => {
                                    this.setCurrentLessonCard(page + 1);
                                }}>
                                Next
                                <AiOutlineRight />
                            </span>
                        )}
                    </footer>
                </div>
            </div>
        );
    }
}
