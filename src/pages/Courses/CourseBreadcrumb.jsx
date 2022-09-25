import React, { Component } from 'react';
import { FaChevronRight } from 'react-icons/fa';
import './CourseBreadcrumb.scss';

export default class CourseBreadcrumb extends Component {
    render() {
        const { firstItem, secondItem, center } = this.props;
        return (
            <header className='course-breadcrumb' style={{ justifyContent: center ? 'center' : undefined }}>
                <div>
                    <span>{firstItem}</span>
                    <FaChevronRight />
                    <span>{secondItem}</span>
                </div>
            </header>
        );
    }
}
