import React, { Component } from 'react';
import Slide from './Slide';
import Quiz from './Quiz/Quiz';
import LessonContext from '../../LessonContext';
import { EventBus } from 'src/helpers/new';

interface IProps {
    course: any;
    lesson: any;
}
interface IState {
    isQuiz: boolean;
    current: any;
    lastAttempts: any[];
    cardIndex: number;
    eventType: string;
}
export default class SlideContainer extends Component<IProps, IState> {
    static contextType = LessonContext;
    state: IState = {
        cardIndex: 0,
        isQuiz: false,
        current: {},
        lastAttempts: [],
        eventType: '',
    };
    componentDidMount() {
        EventBus.on('start-new-quiz', this.isQuizCard);
        EventBus.on('resume-quiz', this.isQuizCard);
        EventBus.on('cancel-quiz', this.isQuizCard);
    }
    componentWillUnmount() {
        EventBus.remove('start-new-quiz');
    }
    isQuizCard = (event: any) => {
        const eventType = event.type;
        const { current, lastAttempts, cardIndex, isQuizCompleted = false } = event.detail;
        if (isQuizCompleted) {
            this.setState({
                isQuiz: false,
                cardIndex: cardIndex,
                eventType: '',
            });
        } else {
            console.log(current);
            console.log(lastAttempts);
            this.setState({
                isQuiz: true,
                current: current,
                lastAttempts: lastAttempts,
                cardIndex: cardIndex,
                eventType: eventType,
            });
        }
    };
    render() {
        // const isQuiz = false;
        if (this.state.isQuiz)
            return (
                <Quiz
                    current={this.state.current}
                    lastAttempt={this.state.lastAttempts}
                    cardIndex={this.state.cardIndex}
                    eventType={this.state.eventType}
                    {...this.props}
                />
            );

        return <Slide {...this.props} quizCardIndex={this.state.cardIndex} />;
    }
}
