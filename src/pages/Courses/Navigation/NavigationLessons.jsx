import React, { Component } from 'react';
import AccordionContext from 'react-bootstrap/AccordionContext';
import { Spinner } from '../../../components/Spinner';
import apiCall from '../../../helpers/apiCall';
import NavigationLesson from './NavigationLesson';
import { NavigationContext } from './NavigationContext';
import { CourseContext } from '../CourseContext';
import './NavigationLessons.scss';

export default class NavigationLessons extends Component {
    state = {
        lessons: null,
        pageStatus: 'LOADING',
    };

    static contextType = AccordionContext;

    async componentDidMount() {
        if (this.context === this.props.chapterId) {
            await this.loadChapterLessons();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.context === this.props.chapterId && prevState.lessons === null) {
            await this.loadChapterLessons();
        }
    }

    loadChapterLessons = async () => {
        const { success, response } = await apiCall('GET', `/users/chapters/${this.props.chapterId}/lessons`);

        if (success) {
            this.setState({
                pageStatus: 'READY',
                lessons: response.docs,
            });
        }
    };

    render() {
        const {
            state: { pageStatus, lessons },
        } = this;

        if (pageStatus === 'READY') {
            return (
                <>
                    {lessons.map((lesson) => (
                        <NavigationContext.Consumer key={lesson._id}>
                            {(navigationContext) => (
                                <CourseContext.Consumer>
                                    {(courseContext) => (
                                        <NavigationLesson
                                            courseContext={courseContext}
                                            navigationContext={navigationContext}
                                            {...lesson}
                                        />
                                    )}
                                </CourseContext.Consumer>
                            )}
                        </NavigationContext.Consumer>
                    ))}
                </>
            );
        }
        return <Spinner />;
    }
}
