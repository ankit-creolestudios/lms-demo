import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import CourseContext from 'src/pages/Course/CourseContext';
import { EventBus } from 'src/helpers/new';

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

interface IProps {}

type TProps = IProps & RouteComponentProps<IRouteProps>;

class ProgressionManager extends Component<TProps> {
    static contextType = CourseContext;

    mounting = false;

    componentDidMount() {
        this.mounting = true;
        window.socket.on('user-lesson-completed', this.completeLesson);
        window.socket.on('user-lesson-unlocked', this.unlockLesson);
        window.socket.on('user-exam-status-update', this.unlockExam);
        EventBus.on('change-lesson', this.changeLesson as any);
        EventBus.on('re-enter-lesson', this.reEnterLesson as any);

        setTimeout(() => {
            this.enterLesson(this.props.match.params.lessonId);
            this.mounting = false;
        }, 250);
    }

    componentWillUnmount() {
        EventBus.remove('change-lesson', this.changeLesson as any);
        EventBus.remove('re-enter-lesson', this.reEnterLesson as any);
        EventBus.remove('enter-pre-exam', this.enterPreExam as any);
        EventBus.remove('enter-post-exam', this.enterPostExam as any);
    }

    componentDidUpdate(prevProps: TProps) {
        if (prevProps.match.params.lessonId !== this.props.match.params.lessonId && !this.mounting) {
            this.enterLesson(this.props.match.params.lessonId);
        }
    }

    completeLesson = (lessonId: string) => {
        console.log('completed - ', lessonId);

        this.context.completeLesson(lessonId);
    };

    unlockLesson = (lessonId: string) => {
        console.log('unlocked - ', lessonId);
        this.context.unlockLesson(lessonId);
    };

    enterLesson = (lessonId: string) => {
        window.socket.emit('enter-user-lesson', lessonId);
        const requiresReAuthentication = this.context?.course?.proctoring?.requiresReAuthentication ?? false;
        if (requiresReAuthentication) {
            EventBus.dispatch('require-auth', { stage: lessonId });
        }
    };

    changeLesson = async (event: Event) => {
        const { lessonId, chapterId } = (event as CustomEvent).detail;
        const { courseId } = this.props.match.params;
        this.props.history.push(`/new/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
    };

    enterPreExam = async (event: Event) => {
        const { courseId } = this.props.match.params;
        this.props.history.push(`/new/courses/${courseId}/preexam`);
    };

    enterPostExam = async (event: Event) => {
        const { courseId } = this.props.match.params;
        this.props.history.push(`/new/courses/${courseId}/postexam`);
    };

    reEnterLesson = () => {
        this.enterLesson(this.props.match.params.lessonId);
    };

    unlockExam = (examStatus: any) => {
        this.context.unlockExam(examStatus);
    };

    render() {
        return null;
    }
}

export default withRouter(ProgressionManager);
