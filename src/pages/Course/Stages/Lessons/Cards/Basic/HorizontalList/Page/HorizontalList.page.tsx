import React, { Component } from 'react';
import CourseContext from 'src/pages/Course/CourseContext';

export interface IProps {}

export default class HorizontalList extends Component<IProps> {
    static contextType = CourseContext;
    render() {
        return (
            <div>
                <b>Card not supported - Horizontal List</b>
            </div>
        );
    }
}
