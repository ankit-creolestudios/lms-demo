import React, { Component, ReactNode } from 'react';
import Course from './Course';
import { IUserCourse } from '../CourseButton';
import { Api } from 'src/helpers/new';
import './Courses.scss';

interface IProps {
    packageId: string;
}

interface IState {
    showCourses: boolean;
    courses: IUserCourse[];
    loaded: boolean;
}

export default class Courses extends Component<IProps, IState> {
    state: IState = {
        showCourses: false,
        courses: [],
        loaded: false,
    };

    componentDidMount() {
        this.loadUserPackageById(this.props.packageId);
    }

    loadUserPackageById = async (id: string) => {
        const { success, response } = await Api.call('get', `/users/packages/${id}/courses`);

        if (success) {
            this.setState({
                courses: response.courses,
                loaded: true,
            });
        }
    };

    toggleCourses = () => {
        this.setState({ showCourses: !this.state.showCourses });
    };

    render(): ReactNode {
        const { showCourses, loaded, courses } = this.state;

        return (
            <div className='package-courses'>
                <h3>Courses</h3>
                <button className='view-courses-button' onClick={this.toggleCourses}>
                    <span>View Courses</span>
                    <i className={`fas fa-chevron-${showCourses ? 'up' : 'down'}`} />
                </button>
                <div className='course-list'>
                    {showCourses &&
                        loaded &&
                        courses.map((course: IUserCourse) => {
                            return <Course course={course} key={course._id} allCourses={courses} />;
                        })}
                </div>
            </div>
        );
    }
}
