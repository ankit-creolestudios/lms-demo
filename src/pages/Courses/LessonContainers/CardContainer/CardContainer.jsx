import React, { Component } from 'react';
import { withRouter } from 'react-router';
import apiCall from '../../../../helpers/apiCall';
import SmallProgress from '../../../../layouts/Lesson/SmallProgress';
import { CourseContext } from '../../CourseContext';
import LessonCard from '../../LessonCard';
import LessonCountdown from '../../LessonCountdown';
import MenuToggle from '../../MenuToggle';
import './CardContainer.scss';
import Feedback from './Feedback';
import Navigation from './Navigation';

class CardContainer extends Component {
    static contextType = CourseContext;

    findBlockingCardIndex = () =>
        this.props.lesson.cards.findIndex((card) => {
            if (!this.context.isAdminPreview) {
                if (card.cardType === 'SINGLE_QUESTION') {
                    if (card?.nextCardAvailable === 'AFTER_ANSWER' && !card?.questionAttempt) {
                        return true;
                    }

                    if (card?.nextCardAvailable === 'AFTER_CORRECT' && card?.questionAttempt?.status !== 'passed') {
                        return true;
                    }
                }
            }

            return false;
        });

    state = {
        activeCardIndex: 0,
        blockingCardIndex: this.findBlockingCardIndex(),
        animationStatus: 'first_in',
    };

    updateBlockingCardIndex = () => {
        this.setState({
            blockingCardIndex: this.findBlockingCardIndex(),
        });
    };

    setDefaultActiveCardIndex = async (lastCardIndexOverride) => {
        const { cardIndex } = this.props.match.params;
        let activeCardIndex = 0;

        if (
            this.context.data.lastCardIndex &&
            this.props.lesson?.previousLesson?._id !== this.context.data.lastLessonId
        ) {
            activeCardIndex = lastCardIndexOverride ?? this.context.data.lastCardIndex;
        }

        if (cardIndex === 'last') {
            const { blockingCardIndex } = this.state;

            activeCardIndex =
                blockingCardIndex && blockingCardIndex !== -1 ? blockingCardIndex : this.props.lesson.cards.length - 1;
        }

        this.setState({
            activeCardIndex,
        });
    };

    setActiveCardIndex = async (index) => {
        if (!this.context.isAdminPreview) {
            await apiCall('POST', `/users/courses/${this.props.match.params.courseId}/latest/card`, {
                lastCardIndex: index,
            });
        }

        this.setState({
            activeCardIndex: index,
        });
    };

    timeoutAnimation = () => {
        setTimeout(() => {
            this.setState({ animationStatus: null });
        }, 550);
    };

    componentDidMount() {
        this.setDefaultActiveCardIndex();
        this.timeoutAnimation();
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.lessonId !== prevProps.match.params.lessonId) {
            if (!this.context.isAdminPreview) {
                await apiCall('POST', `/users/courses/${this.props.match.params.courseId}/latest/card`, {
                    lastCardIndex: 0,
                });
            }

            this.setDefaultActiveCardIndex(0);
        }

        if (prevState.activeCardIndex !== this.state.activeCardIndex) {
            if (prevState.activeCardIndex < this.state.activeCardIndex) {
                this.setState(
                    {
                        animationStatus: 'next_in',
                    },
                    this.timeoutAnimation
                );
            } else {
                this.setState(
                    {
                        animationStatus: 'previous_in',
                    },
                    this.timeoutAnimation
                );
            }
        }
    }

    render() {
        const { lesson, chapter } = this.props,
            { data: course, animateMenu, isMenuOpen } = this.context,
            { activeCardIndex, blockingCardIndex, animationStatus } = this.state,
            card = lesson.cards[activeCardIndex],
            progress = ((activeCardIndex + 1) * 100) / lesson.cards.length;
        return (
            <div
                className={`card-container${animationStatus ? ` card-container--${animationStatus}` : ''}${
                    animateMenu ? ' card-container--animate' : ''
                }${!isMenuOpen ? ' card-container--menu-collapsed' : ''}`}>
                <MenuToggle />
                <SmallProgress />
                <div className='card-container__wrapper'>
                    <header>
                        <h3>{course.title}</h3>
                        <h5>
                            {chapter.title} | {lesson.title}
                        </h5>
                        <div className='card-container__info'>
                            <div className='card-container__timer'>
                                <LessonCountdown lesson={lesson} />
                            </div>
                            {lesson.lessonType !== 'BASIC' && (
                                <div
                                    className={`card-container__badge card-container__badge--${lesson.lessonType?.toLowerCase()}`}>
                                    {lesson.lessonType?.toLowerCase()}
                                </div>
                            )}
                        </div>
                    </header>
                    <LessonCard
                        {...card}
                        cardsQuiz={lesson.cardsQuiz}
                        cardIndex={activeCardIndex}
                        updateBlockingCardIndex={this.updateBlockingCardIndex}
                        lessonLayout='card'
                    />
                    <footer>
                        <Navigation
                            course={course}
                            activeCardIndex={activeCardIndex}
                            setActiveCardIndex={this.setActiveCardIndex}
                            blockingCardIndex={blockingCardIndex}
                        />
                        <Feedback
                            course={course}
                            activeCardIndex={activeCardIndex}
                            setActiveCardIndex={this.setActiveCardIndex}
                        />
                        <div className='card-container__progress'>
                            <div style={{ width: `${progress}%` }}></div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}

export default withRouter(CardContainer);
