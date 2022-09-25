import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import '../../../components/ApiTable/ApiTable.scss';
import { ComponentTabs } from '../../../components/Tabs';
import CourseProgress from './CourseProgress';
import CourseForms from './CourseForms';
import CourseExams from './CourseExams';

class UserProgress extends Component {
    render() {
        return (
            <div className='pt-3'>
                <ComponentTabs>
                    <CourseProgress tabTitle='Progress' courseId={this.props.course._id} />
                    <CourseForms tabTitle='Forms' doc={this.props.course} />
                    <CourseExams tabTitle='Exams' courseId={this.props.course._id} />
                </ComponentTabs>
            </div>
        );
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(UserProgress));
