import React, { Component } from 'react';
import CourseContext from 'src/pages/Course/CourseContext';
import { BsCheck, BsEyeFill, BsLockFill, BsUnlockFill } from 'react-icons/bs';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './Lesson.scss';
import { EventBus } from 'src/helpers/new';
// import EventBus from 'src/helpers/eventBus';

export interface ILesson {
    _id: string;
    chapterId: string;
    title: string;
}

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

type TProps = ILesson & RouteComponentProps<IRouteProps>;

class Lesson extends Component<TProps> {
    static contextType = CourseContext;

    componentDidMount() {
        if (this.isCurrentLesson) {
            document.querySelector('.active')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    componentDidUpdate(prevProps: TProps) {
        if (this.props.match.params.lessonId !== prevProps.match.params.lessonId && this.isCurrentLesson) {
            document.querySelector('.active')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    get isCurrentLesson(): boolean {
        return this.props._id === this.props.match.params.lessonId;
    }

    get isLessonCompleted(): boolean {
        return this.context.completedLessons.includes(this.props._id);
    }

    get isLessonUnlocked(): boolean {
        return this.context.unlockedLessons.includes(this.props._id);
    }

    get icon() {
        if (this.isCurrentLesson) {
            return <BsEyeFill />;
        } else if (this.isLessonCompleted) {
            return <BsCheck />;
        } else if (this.isLessonUnlocked) {
            return <BsUnlockFill />;
        } else {
            return <BsLockFill />;
        }
    }

    get isLessonActive(): boolean {
        return this.isCurrentLesson || this.isLessonCompleted;
    }

    get isLessonAvailable(): boolean {
        return this.isCurrentLesson || this.isLessonCompleted || this.isLessonUnlocked;
    }

    handleLessonChange = () => {
        if (this.isCurrentLesson || !this.isLessonAvailable) return;
        const { chapterId, _id } = this.props;
        EventBus.dispatch('change-lesson', { lessonId: _id, chapterId });
    };

    render() {
        const { title } = this.props;

        return (
            <div
                onClick={this.handleLessonChange}
                className={`navigation-lesson ${this.isLessonAvailable ? 'available' : ''}`}
            >
                <div
                    className={`icon-container ${
                        this.isCurrentLesson ? 'active' : this.isLessonCompleted ? 'completed' : ''
                    }`}
                >
                    {this.icon}
                </div>
                <span>{title}</span>
            </div>
        );
    }
}

export default withRouter(Lesson);
