import React, { Component } from 'react';
import { BsCheck, BsEyeFill, BsLockFill, BsUnlockFill } from 'react-icons/bs';
import { Link, withRouter } from 'react-router-dom';
import { NavigationContext } from './NavigationContext';

class NavigationLesson extends Component {
    state = {
        scrollDidHappen: false,
    };

    static contextType = NavigationContext;

    itemRef = React.createRef();

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.lessonId === this.props._id) {
            if (this.itemRef.current) {
                if (!this.state.scrollDidHappen) {
                    this.setState({
                        scrollDidHappen: true,
                    });

                    if (this.props.match.params.chapterId !== prevProps.match.params.chapterId) {
                        setTimeout(() => {
                            this.itemRef.current.scrollIntoView({ behavior: 'smooth' });
                        }, 500);
                    } else {
                        this.itemRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
        } else {
            if (this.state.scrollDidHappen) {
                this.setState({
                    scrollDidHappen: false,
                });
            }
        }
    }

    render() {
        const {
                _id,
                title,
                unlocked,
                completed,
                userChapterId,
                match: {
                    params: { courseId, lessonId },
                },
            } = this.props,
            lessonUrl = `/courses/${courseId}/chapters/${userChapterId}/lessons/${_id}/cards/1`,
            LessonIcon = completed || this.props.courseContext.completedLessons.includes(_id) ? BsCheck : BsUnlockFill;

        if (lessonId === _id) {
            return (
                <Link ref={this.itemRef} to={lessonUrl} className='cmenu__lesson cmenu__lesson--active'>
                    <div className='cmenu__lesson-icon'>
                        <BsEyeFill />
                    </div>
                    <span>{title}</span>
                </Link>
            );
        }

        if (!unlocked && !this.props.courseContext.unlockedLessons.includes(_id)) {
            return (
                <span ref={this.itemRef} className='cmenu__lesson'>
                    <div className='cmenu__lesson-icon'>
                        <BsLockFill />
                    </div>
                    <span>{title}</span>
                </span>
            );
        }

        return (
            <Link
                ref={this.itemRef}
                to={lessonUrl}
                className={`cmenu__lesson${
                    completed || this.props.courseContext.completedLessons.includes(_id)
                        ? ' cmenu__lesson--complete'
                        : ''
                }`}>
                <div className='cmenu__lesson-icon'>
                    <LessonIcon />
                </div>
                <span>{title}</span>
            </Link>
        );
    }
}

export default withRouter(NavigationLesson);
