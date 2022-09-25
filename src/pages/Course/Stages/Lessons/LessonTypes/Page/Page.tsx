import React, { Component } from 'react';
import LessonContext from '../../LessonContext';
import { Spinner } from 'src/components/Spinner';
import LessonCard, { ICard } from '../../Cards/LessonCard';
import Header from './Header';
import Footer from './Footer';
import './page.scss';

export default class Page extends Component {
    static contextType = LessonContext;

    render() {
        const { isLoading, lesson } = this.context;
        if (isLoading) return <Spinner />;

        const { cards } = lesson;
        return (
            <div className='page-lesson-container'>
                <Header
                    lessonName={this.context.lesson.title}
                    chapterId={this.context.lesson.userChapterId}
                    userCourseId={this.context.lesson.userCourseId}
                />
                <div className='card-list'>
                    {cards.map((card: ICard) => {
                        return <LessonCard key={card._id} {...card} />;
                    })}
                </div>
                <Footer />
            </div>
        );
    }
}
