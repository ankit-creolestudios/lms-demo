import React, { Component } from 'react';
import { withRouter, Route, Switch } from 'react-router';
import Lesson from './Lesson';
import { CourseNavigation } from './Navigation';
import { CourseContext } from './CourseContext';
import { MenuItem } from './Navigation/MenuItem';
import './Course.scss';
import NavigationExam from './NavigationExam';
import PreExamForm from './PreExamForm';

class Course extends Component {
    static contextType = CourseContext;

    render() {
        const { menuHidden, lessonLayout } = this.context;

        return (
            <div
                className={`course-layout${menuHidden ? ' cmenu--hidden' : ''} ${(
                    lessonLayout || ''
                ).toLowerCase()}-layout`}>
                <CourseNavigation
                    itemsEndpoint={`/users/courses/${this.props.match.params.courseId}/chapters`}
                    itemsComponent={MenuItem}
                    showHeader={true}
                    menuHidden={menuHidden}>
                    <NavigationExam />
                </CourseNavigation>
                <Switch>
                    <Route path='/courses/:courseId/preexam' component={PreExamForm} />
                    <Route
                        path='/courses/:courseId/chapters/:chapterId/lessons/:lessonId/(cards)?/:cardIndex?'
                        component={Lesson}
                    />
                </Switch>
            </div>
        );
    }
}

export default withRouter(Course);
