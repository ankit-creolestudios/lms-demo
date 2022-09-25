import React, { Component } from 'react';
import Countdown from 'react-countdown';
import { LessonContext } from './LessonContext';
import { withRouter } from 'react-router-dom';
import './LessonCountdown.scss';

class LessonCountdown extends Component {
    static contextType = LessonContext;

    countDownRef = React.createRef();

    state = {
        countdownLimit: 0,
    };

    componentDidMount() {
        this.enterUserLesson(this.props.match.params.lessonId);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.match.params.lessonId !== this.props.match.params.lessonId) {
            this.enterUserLesson(this.props.match.params.lessonId);
        }
    }

    enterUserLesson = (lessonId) => {
        if (!this.context.isAdminPreview) {
            window.socket.emit('enter user lesson', lessonId);

            window.socket.on('entered user lesson', ({ currentTime, lessonId: resLessonId, requiredTime }) => {
                if (resLessonId === lessonId && requiredTime) {
                    this.setState({
                        countdownLimit: new Date().getTime() + (requiredTime - currentTime),
                    });
                }
            });
        }
    };

    handleTimerComplete = () => {
        this.context.unlockNextLessonFn();
    };

    render() {
        const { lesson } = this.props,
            { countdownLimit } = this.state;

        if (!!countdownLimit) {
            return (
                <div
                    className={`lesson-timer${
                        lesson.unlockNextLesson !== 'REQUIRED_TIME_MET' || !!lesson?.nextLesson?.unlocked
                            ? ' lesson-timer--hidden'
                            : ''
                    }`}>
                    <span>Lesson time remaining: </span>
                    <Countdown
                        ref={this.countDownRef}
                        date={countdownLimit}
                        onComplete={
                            lesson.unlockNextLesson === 'REQUIRED_TIME_MET' && !lesson?.nextLesson?.unlocked
                                ? this.handleTimerComplete
                                : undefined
                        }
                        renderer={({ hours, minutes, seconds }) => {
                            return (
                                <span>
                                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
                                    {seconds.toString().padStart(2, '0')}
                                </span>
                            );
                        }}
                    />
                </div>
            );
        }
        return <></>;
    }
}

export default withRouter(LessonCountdown);
