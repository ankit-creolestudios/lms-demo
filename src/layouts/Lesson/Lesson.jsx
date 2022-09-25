import React, { Component } from 'react';
import SmallProgress from './SmallProgress';
import './Lesson.scss';

export default class Lesson extends Component {
    render() {
        return <div className={`lesson-content ${this.props.className}`}>{this.props.children}</div>;
    }
}
