import React, { Component } from 'react';
import CourseContext from 'src/pages/Course/CourseContext';

export interface IProps {}

export default class MnemonicPage extends Component<IProps> {
    static contextType = CourseContext;
    render() {
        return (
            <div>
                <b>Card not supported - Mnemonics Page</b>
            </div>
        );
    }
}
