import React, { Component, ReactNode } from 'react';
import { Switch, Route } from 'react-router';
import { Api, EventBus } from 'src/helpers/new';
import { Spinner } from 'src/components/Spinner';
import CourseContext, { IExamStatus } from './CourseContext';
import { Enrollment, Lessons, PreExam, Exam, PostExam } from './Stages';
import Proctoring from './Proctoring';

interface IRouteProps {
    match: {
        params: {
            courseId: string;
            chapterId?: string;
            lessonId?: string;
            courseStage?: 'enrollment' | 'chapters' | 'preexam' | 'exam' | 'postexam';
        };
    };
    history: {
        push: (path: string) => void;
        replace: (path: string) => void;
    };
}

export interface IProps extends IRouteProps {}

interface IState {
    isLoading: boolean;
    course?: any;
    unlockedLessons: string[];
    completedLessons: string[];
    lessonLayout: any;
    examStatus: IExamStatus;
}

export default class Course extends Component<IProps, IState> {
    state: IState = {
        isLoading: true,
        unlockedLessons: [],
        completedLessons: [],
        lessonLayout: null,
        examStatus: {
            available: false,
            message: '',
        },
    };

    async componentDidMount() {
        const { success, response } = await Api.call('get', `/users/courses/${this.props.match.params.courseId}`);

        if (success) {
            response.lessonType = response.lessonType ?? 'page';
            delete response.attemptDelay;
            delete response.attemptLimit;
            delete response.availability;
            delete response.description;
            delete response.edditingAdmins;
            delete response.enrollmentForm;
            delete response.examAttempts;
            delete response.extensionLimit;
            this.setState(
                {
                    course: response,
                    completedLessons: response.lessons.completedLessons ?? [],
                    unlockedLessons: response.lessons.unlockedLessons ?? [],
                    isLoading: false,
                },
                () => {
                    this.handleStageRedirect();
                }
            );
        }
        EventBus.on('enter-pre-exam', this.enterPreExam as any);
        EventBus.on('enter-post-exam', this.enterPostExam as any);
    }

    componentWillUnmount() {
        EventBus.remove('enter-pre-exam', this.enterPreExam as any);
        EventBus.remove('enter-post-exam', this.enterPostExam as any);
    }

    enterPreExam = async (event: Event) => {
        const { courseId } = this.props.match.params;
        this.props.history.push(`/new/courses/${courseId}/preexam`);
    };

    enterPostExam = async (event: Event) => {
        const { courseId } = this.props.match.params;
        this.props.history.push(`/new/courses/${courseId}/postexam`);
    };

    handleStageRedirect = () => {
        const { course } = this.state;
        const { history } = this.props;
        const baseUrl = '/new/courses';

        const { userNotEnrolled, courseInProgress, userCompletedCourse, userInExam, userCompletedExam } =
            this.userCourseStatuses;

        if (userNotEnrolled) {
            history.replace(`${baseUrl}/${course._id}/enrollment`);
        } else if (courseInProgress) {
            history.replace(`${baseUrl}/${course._id}/chapters/${course.lastChapterId}/lessons/${course.lastLessonId}`);
        } else if (userCompletedCourse) {
            history.replace(`${baseUrl}/${course._id}/preexam`);
        } else if (userInExam) {
            history.replace(`${baseUrl}/${course._id}/postexam`);
        } else if (userCompletedExam) {
            history.replace(`${baseUrl}/${course._id}/chapters/${course.lastChapterId}/lessons/${course.lastLessonId}`);
        }
    };
    get userCourseStatuses(): {
        userInExam: boolean;
        userCompletedExam: boolean;
        userNotEnrolled: boolean;
        courseInProgress: boolean;
        userCompletedCourse: boolean;
    } {
        const { course } = this.state;
        const { match } = this.props;

        const userNotEnrolled = !course.enrollmentUpdatedAt && match.params.courseStage !== 'enrollment';
        const courseInProgress =
            ((course.status === 'NEW' && !match.params.lessonId) ||
                (course.status === 'NEW' && !match.params.chapterId)) &&
            !match.params.courseStage;
        const userCompletedCourse = !course.preExamUpdatedAt && course.status !== 'NEW';
        const userInExam =
            course.status === 'IN_EXAM' &&
            match.params.courseStage !== 'exam' &&
            match.params.courseStage !== 'postexam';
        const userCompletedExam =
            (course.status === 'EXAM_PASSED' || course.status === 'FAILED') && match.params.courseStage !== 'postexam';

        return { userNotEnrolled, courseInProgress, userCompletedCourse, userInExam, userCompletedExam };
    }

    unlockLesson = (lessonId: string) => {
        const unlockedLessons = this.state.unlockedLessons;
        if (!unlockedLessons.includes(lessonId)) {
            unlockedLessons.push(lessonId);
            this.setState({ unlockedLessons });
        }
    };

    unlockExam = (examStatus: any) => {
        this.setState({ examStatus: examStatus });
    };

    completeLesson = (lessonId: string) => {
        const completedLessons = this.state.completedLessons;
        if (!completedLessons.includes(lessonId)) {
            completedLessons.push(lessonId);
            this.setState({ completedLessons });
        }
    };

    public render(): ReactNode {
        const { course, unlockedLessons, completedLessons, isLoading, examStatus } = this.state;
        const { unlockLesson, completeLesson, unlockExam } = this;

        if (isLoading) return <Spinner />;

        return (
            <CourseContext.Provider
                value={{
                    course,
                    examStatus,
                    unlockedLessons: unlockedLessons,
                    completedLessons: completedLessons,
                    unlockLesson,
                    completeLesson,
                    unlockExam,
                }}
            >
                <Switch>
                    <Route exact path='/new/courses/:courseId/enrollment' component={Enrollment} />
                    <Route path='/new/courses/:courseId/preexam' component={PreExam} />
                    <Route exact path='/new/courses/:courseId/exam' component={Exam} />
                    <Route exact path='/new/courses/:courseId/postexam' component={PostExam} />
                    <Route
                        path='/new/courses/:courseId/:courseParam?/:chapterId?/(lessons)?/:lessonId?/(cards)?/:cardIndex?'
                        component={Lessons}
                    />
                </Switch>
                <Proctoring />
            </CourseContext.Provider>
        );
    }
}
