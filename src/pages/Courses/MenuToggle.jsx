import React, { Component } from 'react';
import { RiMenuUnfoldLine, RiMenuFoldLine } from 'react-icons/ri';
import { CourseContext } from './CourseContext';
import './MenuToggle.scss';

export default class MenuToggle extends Component {
    static contextType = CourseContext;

    render() {
        return (
            <div className='cmenu-toggle' onClick={this.context.toggleIsMenuOpen}>
                {!this.context.isMenuOpen ? <RiMenuUnfoldLine /> : <RiMenuFoldLine />}
            </div>
        );
    }
}
