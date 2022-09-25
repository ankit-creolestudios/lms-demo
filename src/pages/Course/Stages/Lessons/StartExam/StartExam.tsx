import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper/ConditialWrapper';
import { EventBus } from 'src/helpers/new';
import CourseContext from 'src/pages/Course/CourseContext';
import StartExamPage from '../LessonTypes/Page/StartExam/StartExam.page';
import StartExamSlide from '../LessonTypes/Slide/StartExam/StartExam.slide';

interface IRouteProps {
    lessonId: string;
    courseId: string;
}
interface IProps {
    lessonContext: any;
    isFinalExamActive: boolean;
    examBtnCls: string;
}
interface IState {}
export type TProps = IProps & RouteComponentProps<IRouteProps>;

class StartExam extends Component<TProps, IState> {
    static contextType = CourseContext;

    startExam = () => {
        EventBus.dispatch('enter-pre-exam');
    };

    render() {
        const {
            course: { lessonType },
        } = this.context;
        if (!this.props.isFinalExamActive) return <></>;
        return lessonType === 'slide' ? (
            <StartExamSlide clickHandler={this.startExam} />
        ) : (
            <StartExamPage clickHandler={this.startExam} />
        );
    }
}

export default withRouter(StartExam);
