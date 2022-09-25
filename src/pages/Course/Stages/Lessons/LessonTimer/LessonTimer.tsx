import React, { Component } from 'react';
import { EventBus } from 'src/helpers/new';
import Countdown from 'react-countdown';
import CourseContext from 'src/pages/Course/CourseContext';

interface IProps {
    lessonId: string;
}

interface IState {
    timeRemaining: number;
    inFocus: boolean;
}

export default class LessonTimer extends Component<IProps, IState> {
    static contextType = CourseContext;
    state: IState = {
        timeRemaining: 0,
        inFocus: true,
    };

    timerRef = React.createRef();

    componentDidMount() {
        window.socket.on('user-lesson-entered', this.setTimer);
        window.socket.on('user-lesson-timer-complete', this.clearTimer);
        if (this.context.course.outOfFocusPause) {
            EventBus.on('blur', this.handlePauseTimer);
            EventBus.on('focus', this.handleResumeTimer);
        }
    }

    componentWillUnmount() {
        if (this.context.course.outOfFocusPause) {
            EventBus.remove('blur', this.handlePauseTimer);
            EventBus.remove('focus', this.handleResumeTimer);
        }
    }

    handlePauseTimer = () => {
        window.socket.emit('leave-user-lesson', this.props.lessonId);
        (this.timerRef as any)?.current?.pause();
    };

    handleResumeTimer = () => {
        window.socket.emit('enter-user-lesson', this.props.lessonId);
        (this.timerRef as any)?.current?.start();
    };

    setTimer = (timeRemaining: number) => {
        if (timeRemaining < 0) {
            timeRemaining = 0;
        }

        this.setState({ timeRemaining });
    };

    clearTimer = () => {
        this.setState({ timeRemaining: 0 });
    };

    render() {
        const { timeRemaining } = this.state;

        if (timeRemaining === 0) {
            return <span>00:00:00</span>;
        }
        return (
            <>
                <Countdown
                    ref={this.timerRef as any}
                    date={Date.now() + timeRemaining}
                    renderer={({ hours, minutes, seconds }) => {
                        return (
                            <span>
                                {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
                                {seconds.toString().padStart(2, '0')}
                            </span>
                        );
                    }}
                />
            </>
        );
    }
}
