import React, { Component } from 'react';
import apiCall from '../../helpers/apiCall';
import MenuItems from '../../components/User/CourseMenu/MenuItems';

export default class CourseNavigationMenu extends Component {
    state = {
        chapters: [],
    };

    componentDidMount = async () => {
        const { success, response } = await apiCall('GET', `/courses/chapters/course/${this.props.course._id}`);

        if (success && response) {
            this.setState({ chapters: response.chapters });
        }
    };

    render() {
        return (
            <div
                style={{
                    display: 'inline-block',
                    verticalAlign: 'top',
                    width: '15%',
                    height: '100%',
                    marginRight: '10px',
                    background: 'rgb(255, 255, 255)',
                    overflowY: 'auto',
                    maxHeight: '70vh',
                }}>
                <MenuItems
                    admin={true}
                    adminChapters={this.state.chapters}
                    adminCourse={this.props.course}
                    withBorder={true}
                    menuOpen={true}
                />
            </div>
        );
    }
}
