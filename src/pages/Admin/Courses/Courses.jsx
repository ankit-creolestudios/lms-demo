import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import CourseTable from './CourseTable';
import CourseRoutes from './CourseRoutes';

class Courses extends Component {
    componentDidMount() {
        this.props.pushBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Courses',
            path: '/admin/courses',
        });
    }

    render() {
        return (
            <Switch>
                <Route exact path='/admin/courses' component={CourseTable} />
                <Route path='/admin/courses/:courseId' component={CourseRoutes} />
            </Switch>
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
})(Courses);
