import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import LessonContext from '../../LessonContext';
import LessonCard, { ICard } from '../../Cards/LessonCard';
import { Spinner } from 'src/components/Spinner';
import { Api, EventBus } from 'src/helpers/new';
import Header from './Header';
import MenuToggle from 'src/pages/Courses/MenuToggle';
import SmallProgress from 'src/layouts/Lesson/SmallProgress';
import Navigation from './Footer/Navigation';
import Feedback from './Footer/Feedback';
import './SlideContainer.scss';

interface IRouteProps {
    courseId: string;
    lessonId: string;
    cardIndex: string;
}
interface IProps {
    course: any;
    lesson: any;
    quizCardIndex?: any;
}
interface IState {
    activeCardIndex: number;
    blockingCardIndex: number | null;
    animationStatus: string | null;
    isComponentReady: boolean;
}
interface IChapter {
    _id: string;
    title: string;
}
type TProps = IProps & RouteComponentProps<IRouteProps>;

class Slide extends Component<TProps, IState> {
    static contextType = LessonContext;
    state: IState = {
        activeCardIndex: 0,
        blockingCardIndex: -1,
        animationStatus: 'first_in',
        isComponentReady: false,
    };
    themeRef: any = React.createRef();

    componentDidMount() {
        this.setDefaultActiveCardIndex();
    }

    async componentDidUpdate(prevProps: any, prevState: IState) {
        if (this.props.match.params.lessonId !== prevProps.match.params.lessonId) {
            if (!this.context.isAdminPreview) {
                await Api.call('POST', `/users/courses/${this.props.match.params.courseId}/latest/card`, {
                    lastCardIndex: 0,
                });
            }
            // if (this.props.quizCardIndex) this.setDefaultActiveCardIndex(this.props.quizCardIndex);
            this.setDefaultActiveCardIndex(this.props.quizCardIndex ?? 0);
        }
    }

    setDefaultActiveCardIndex = async (lastCardIndexOverride?: number) => {
        const { cardIndex } = this.props.match.params;
        let activeCardIndex = 0;

        if (
            this.props.course.lastCardIndex &&
            this.props.lesson?.previousLesson?._id !== this.props.course.lastLessonId
        ) {
            activeCardIndex = lastCardIndexOverride ?? this.props.course.lastCardIndex;
        }

        if (cardIndex === 'last') {
            const { blockingCardIndex } = this.state;

            activeCardIndex =
                blockingCardIndex && blockingCardIndex !== -1 ? blockingCardIndex : this.props.lesson.cards.length - 1;
        }
        // this.setDefaultActiveCardIndex(this.props.quizCardIndex ?? 0);
        this.setState({
            activeCardIndex: this.props.quizCardIndex ?? activeCardIndex,
        });
    };

    setActiveCardIndex = async (index: number) => {
        if (!this.context.isAdminPreview) {
            await Api.call('POST', `/users/courses/${this.props.match.params.courseId}/latest/card`, {
                lastCardIndex: index,
            });
        }

        this.setState({
            activeCardIndex: index,
        });
    };

    render() {
        const { course } = this.props;
        const { isLoading, lesson, chapter } = this.context;
        const chapterName = chapter && chapter.length > 0 ? chapter[0]?.doc?.title : '';
        const { isComponentReady, activeCardIndex, blockingCardIndex, animationStatus } = this.state;

        if (isLoading) return <Spinner />;
        const progress = ((activeCardIndex + 1) * 100) / lesson.cards.length;
        const card = lesson.cards[activeCardIndex];
        const { cards } = lesson;
        const { theme = null, lessonLayout, cardsQuiz } = card;

        return (
            <div className={`slide-container slide-container--menu-collapsed`}>
                {/* <MenuToggle /> */}
                {/* <SmallProgress /> */}
                <div className='slide-container__wrapper'>
                    <Header
                        lessonName={this.context.lesson.title}
                        lessonId={this.context.lesson._id}
                        lessonType={this.context.lesson.lessonType}
                        chapterName={chapterName}
                        courseTitle={course.title}
                    />
                    <main
                        ref={this.themeRef}
                        className={`lesson-cards__theme-${theme || 'default'} ${
                            isComponentReady ? ' lesson-cards__ready' : ''
                        }'}`}
                    >
                        <LessonCard
                            {...card}
                            key={card._id}
                            cardsQuiz={lesson.cardsQuiz}
                            cardIndex={activeCardIndex}
                            updateBlockingCardIndex={'false'}
                            lessonLayout='card'
                        />
                    </main>

                    <footer>
                        {/* <Navigation /> */}
                        <Navigation
                            course={course}
                            activeCardIndex={activeCardIndex}
                            setActiveCardIndex={this.setActiveCardIndex}
                            blockingCardIndex={blockingCardIndex}
                            cardType={card.cardType}
                        />
                        <Feedback
                            course={course}
                            activeCardIndex={activeCardIndex}
                            setActiveCardIndex={this.setActiveCardIndex}
                        />
                        <div className='slide-container__progress'>
                            <div style={{ width: `${progress}%` }}></div>
                        </div>
                    </footer>
                </div>
            </div>
        );
    }
}
export default withRouter(Slide);
