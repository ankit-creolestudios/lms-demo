import React, { Component, ReactNode } from 'react';
import { CourseButton, IUserCourse } from '../CourseButton';
import { ProgressBar } from '../ProgressBar';
import { FileImage } from 'src/components/ApiFile';
import './Course.scss';

interface IProps {
    course: IUserCourse;
    allCourses: IUserCourse[];
}

export default class Course extends Component<IProps, unknown> {
    render(): ReactNode {
        const { course, allCourses } = this.props;

        return (
            <div className='course'>
                <FileImage className='image' fileId={course.image} />
                <h6>{course.title}</h6>
                <ProgressBar progress={course.percentageProgress} />
                <CourseButton userCourse={course} allCourses={allCourses} />
            </div>
        );
    }
}
