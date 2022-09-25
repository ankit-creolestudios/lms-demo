import React, { Component } from 'react';
import { Switch, Route } from 'react-router';
import CourseEnrollment from './CourseEnrollment';
import Course from './Course';
import FinalExam from './FinalExam';
import PostExamForm from './PostExamForm';
import { CourseContext } from './CourseContext';
import apiCall from '../../helpers/apiCall';
import { Spinner } from '../../components/Spinner';

export default class Courses extends Component {
    state = {
        course: null,
        completedLessons: [],
        unlockedLessons: [],
        pageStatus: 'LOADING',
        lessonLayout: null,
        isMenuOpen: false,
        preExamFields: null,
        animateMenu: false,
        canSitExam: false,
    };

    componentDidMount() {
        this.updateCourseData();
        this.canUserSitExam();
    }

    updateCourseData = async () => {
        const { success, response } = await apiCall('GET', `/users/courses/${this.props.match.params.courseId}`);

        if (success) {
            this.setState(
                {
                    course: response,
                    pageStatus: 'READY',
                },
                () => {
                    this.handleRouting();
                    localStorage.removeItem('examCompleted');
                    localStorage.removeItem('postExamCompleted');
                    localStorage.removeItem('enrollmentCompleted');
                    localStorage.removeItem('isEnrollmentSubmittedNow');
                }
            );
        }
    };

    canUserSitExam = async () => {
        const { success, response } = await apiCall('GET', `/users/exam/${this.props.match.params.courseId}/available`);

        if (success) {
            this.setState({ canSitExam: response.available });
        }
    };

    componentDidUpdate(prevProps, prevState) {
        if (this.state.course) {
            this.handleRouting();
        }
    }

    setLessonLayout = (lessonLayout) => {
        this.setState({ lessonLayout }, () => {
            setTimeout(() => {
                this.setState({
                    animateMenu: true,
                });
            }, 50);
        });
    };

    toggleIsMenuOpen = () => {
        this.setState({
            isMenuOpen: !this.state.isMenuOpen,
        });
    };

    handleRouting = () => {
        const {
            state: { course },
            props: { match, history: routerHistory },
        } = this;

        if (
            course.status === 'IN_EXAM' &&
            match.params.courseParam !== 'exam' &&
            match.params.courseParam !== 'postexam' &&
            !localStorage.getItem('examCompleted')
        ) {
            routerHistory.push(`/courses/${course._id}/exam`);
            return;
        }

        if (
            (course.status === 'EXAM_PASSED' || course.status === 'FAILED' || localStorage.getItem('examCompleted')) &&
            match.params.courseParam !== 'postexam' &&
            !course.postExamUpdatedAt &&
            !localStorage.getItem('postExamCompleted')
        ) {
            routerHistory.push(`/courses/${course._id}/postexam`);
            return;
        }

        if (['exam', 'chapters', 'preexam', 'postexam', 'enrollment'].includes(match.params.courseParam)) {
            return;
        }

        if (
            !('enrollmentUpdatedAt' in course) &&
            match.params.courseParam !== 'enrollment' &&
            !localStorage.getItem('enrollmentCompleted', true)
        ) {
            routerHistory.push(`/courses/${course._id}/enrollment?ref=NO_ENROLLMENT`);
            return;
        }

        if (!('preExamUpdatedAt' in course) && course.status !== 'NEW') {
            routerHistory.push(`/courses/${course._id}/preexam`);
            return;
        }

        if (
            ((course.status === 'NEW' && !('lessonId' in match.params)) || !('chapterId' in match.params)) &&
            !match.params.courseParam
        ) {
            routerHistory.replace(
                `/courses/${course._id}/chapters/${course.lastChapterId}/lessons/${course.lastLessonId}`
            );
            return;
        }
    };

    unlockLesson = (lessonId) => {
        if (!this.state.unlockedLessons.includes(lessonId)) {
            this.setState({
                unlockedLessons: this.state.unlockedLessons.concat(lessonId),
            });
        }
    };

    completeLesson = (lessonId) => {
        if (!this.state.completedLessons.includes(lessonId)) {
            this.setState(
                {
                    completedLessons: this.state.completedLessons.concat(lessonId),
                    course: {
                        ...this.state.course,
                        lessons: {
                            ...this.state.course.lessons,
                            completed: this.state.course.lessons.completed + 1,
                        },
                    },
                },
                () => {
                    this.updateCourseData();
                    this.canUserSitExam();
                }
            );
        }
    };

    render() {
        const { pageStatus, lessonLayout } = this.state;

        if (pageStatus === 'LOADING') {
            return (
                <div className='course-layout'>
                    <Spinner />
                </div>
            );
        }

        const { course, unlockedLessons, completedLessons, isMenuOpen, animateMenu, canSitExam } = this.state;

        return (
            <CourseContext.Provider
                value={{
                    data: course,
                    unlockLesson: this.unlockLesson,
                    completeLesson: this.completeLesson,
                    setLessonLayout: this.setLessonLayout,
                    toggleIsMenuOpen: this.toggleIsMenuOpen,
                    updateCourseData: this.updateCourseData,
                    unlockedLessons,
                    completedLessons,
                    lessonLayout,
                    isMenuOpen,
                    animateMenu,
                    canSitExam,
                }}
            >
                <Switch>
                    <Route exact path='/courses/:courseId/enrollment' component={CourseEnrollment} />
                    <Route exact path='/courses/:courseId/exam' component={FinalExam} />
                    <Route exact path='/courses/:courseId/postexam' component={PostExamForm} />
                    <Route
                        path='/courses/:courseId/:courseParam?/:chapterId?/(lessons)?/:lessonId?/(cards)?/:cardIndex?'
                        component={Course}
                    />
                </Switch>
            </CourseContext.Provider>
        );
    }
}
