import React, { Component, ReactNode } from 'react';
import { FileImage } from 'src/components/ApiFile';
import { CourseButton } from '../CourseButton';
import { ProgressBar } from '../ProgressBar';
import ShareButton from '../ShareButton';
import './CourseCard.scss';

interface IProps {
    packageId: string;
    userCourse: any;
    image: string;
}

export default class CourseCard extends Component<IProps, unknown> {
    render(): ReactNode {
        const { userCourse, image, packageId } = this.props;

        return (
            <div className='course-card'>
                <div className='course-contents'>
                    <FileImage className='image' fileId={image} />
                    <div className='description'>
                        <h3>{userCourse.title}</h3>
                        <div dangerouslySetInnerHTML={{ __html: userCourse.description }} />
                    </div>
                </div>
                <div className='course-controls'>
                    <ProgressBar progress={userCourse.percentageProgress} />
                    <CourseButton userCourse={userCourse} packageId={packageId} />
                </div>
                <ShareButton packageId={packageId} />
            </div>
        );
    }
}
