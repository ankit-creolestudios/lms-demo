import React, { Component } from 'react';
import { EventBus } from 'src/helpers/new';
import LessonTimer from 'src/pages/Course/Stages/Lessons/LessonTimer';
import LessonContext from '../../../LessonContext';
import NextLessonButton from './NextLessonButton';
import { StartExam } from 'src/pages/Course/Stages/Lessons/StartExam';
import './Footer.scss';

export default class Footer extends Component {
    static contextType = LessonContext;

    previousLesson = () => {
        EventBus.dispatch('change-lesson', {
            lessonId: this.context.lesson.previousLesson._id,
            chapterId: this.context.lesson.previousLesson.userChapterId,
        });
    };

    nextLesson = () => {
        EventBus.dispatch('change-lesson', {
            lessonId: this.context.lesson.nextLesson._id,
            chapterId: this.context.lesson.nextLesson.userChapterId,
        });
    };

    render() {
        const { _id, previousLesson, nextLesson } = this.context.lesson;
        const isFinalExamActive = true;

        return (
            <div className='page-footer'>
                <div className='buttons-container'>
                    {previousLesson ? (
                        <button onClick={this.previousLesson} className='previous'>
                            Previous
                        </button>
                    ) : (
                        <div></div>
                    )}
                    <LessonTimer lessonId={_id} />
                    {nextLesson && nextLesson._id ? (
                        <NextLessonButton id={nextLesson._id} handleClick={this.nextLesson} />
                    ) : (
                        <StartExam
                            lessonContext={this.context}
                            isFinalExamActive={isFinalExamActive}
                            examBtnCls={`exam-button`}
                        />
                    )}
                </div>
            </div>
        );
    }
}
