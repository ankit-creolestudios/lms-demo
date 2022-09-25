import React, { Component } from 'react';
import { connect } from 'react-redux';
import './User.scss';
class UserLayout extends Component {
    render() {
        return (
            <div className='lesson-layout'>
                <main className='main'>{this.props.children}</main>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const { currentLessonLayout, courseMenuOpen, showCourseMenu, loggedIn } = state;
    return {
        currentLessonLayout,
        courseMenuOpen,
        showCourseMenu,
        loggedIn,
    };
};

export default connect(mapStateToProps)(UserLayout);
