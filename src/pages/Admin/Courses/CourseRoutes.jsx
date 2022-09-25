import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import apiCall from '../../../helpers/apiCall';
import Course from './Course';
import EnrolledStudentsList from './EnrolledStudentsList';
import Lesson from './Lesson';
import { connect } from 'react-redux';
import AdminCourseContext from './AdminCourseContext';

class CourseRoutes extends Component {
    state = {
        _id: '',
        title: '',
    };

    async componentDidMount() {
        if (this.props.match.params.courseId !== 'new' && this.props.match.params.courseId !== 'ext') {
            const { success, response, message } = await apiCall('GET', `/courses/${this.props.match.params.courseId}`);

            if (success) {
                this.setState({
                    _id: response._id,
                    title: response.title,
                });

                this.props.pushBreadcrumbLink({
                    text: `Course: ${response.title}`,
                    path: `/admin/courses/${response._id}`,
                });
            } else {
                this.props.setGlobalAlert({
                    type: 'success',
                    message: 'Failed to load course data: ' + message,
                });
            }
        }
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: `Course: ${this.state.title}`,
            path: `/admin/courses/${this.state._id}`,
        });
    }

    render() {
        return (
            <AdminCourseContext.Provider value={this.state}>
                <Switch>
                    <Route exact path='/admin/courses/:courseId/students' component={EnrolledStudentsList} />
                    <Route
                        exact
                        path='/admin/courses/:courseId/chapters/:chapterId/lessons/:lessonId'
                        component={Lesson}
                    />
                    <Route path='/admin/courses/:courseId' key='admin-courses-edit' component={Course} />
                </Switch>
            </AdminCourseContext.Provider>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(CourseRoutes);
