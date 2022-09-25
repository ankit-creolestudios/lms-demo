import React, { Component } from 'react';
import './Header.scss';
import LessonTimer from 'src/pages/Course/Stages/Lessons/LessonTimer/LessonTimer';

interface IProps {
    lessonName: string;
    lessonType: string;
    courseTitle: string;
    lessonId: string;
    chapterName: string;
}

interface IState {}

export default class Header extends Component<IProps, IState> {
    state: IState = {};
    timerRef = React.createRef();

    shouldComponentUpdate(nextProps: IProps) {
        if (nextProps.lessonId === this.props.lessonId) return false;
        return true;
    }

    render() {
        const { courseTitle, lessonName, lessonType, lessonId, chapterName } = this.props;
        return (
            <div className='lesson-slide-header'>
                <header>
                    <h3>{courseTitle}</h3>
                    <div>
                        <h5 className='lesson-name'>
                            {chapterName} | {lessonName}
                        </h5>
                        <span className='lesson-timer'>
                            <LessonTimer lessonId={lessonId} />
                        </span>
                    </div>

                    <div className='slide-container__info'>
                        {lessonType !== 'BASIC' && (
                            <div
                                className={`slide-container__badge slide-container__badge--${lessonType?.toLowerCase()}`}
                            >
                                {lessonType?.toLowerCase()}
                            </div>
                        )}
                    </div>
                </header>
            </div>
        );
    }
}
