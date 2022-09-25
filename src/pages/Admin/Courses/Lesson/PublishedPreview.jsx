import React, { Component } from 'react';
import apiCall from '../../../../helpers/apiCall';
import { CourseContext } from '../../../Courses/CourseContext';
import { CardContainer, PageContainer } from '../../../Courses/LessonContainers';
import { LessonContext } from '../../../Courses/LessonContext';

export default class PublishedPreview extends Component {
    state = {
        cards: [],
        lesson: {},
        feedback: {
            show: false,
            expanded: false,
        },
    };

    setFeedback = (feedback, cb) => {
        this.setState(
            {
                feedback: {
                    ...this.state?.feedback,
                    ...feedback,
                },
            },
            cb
        );
    };

    componentDidMount = async () => {
        await this.loadLessonCards(this.props.currentLessonId);
    };

    async componentDidUpdate(prevProps, prevState) {
        if (prevProps.currentLessonId !== this.props.currentLessonId || this.props.forcePublishedPreviewUpdate) {
            await this.loadLessonCards(this.props.currentLessonId);
        }
    }

    loadLessonCards = async (id) => {
        const { success, response } = await apiCall('GET', `/courses/lessons/${id}/cards`),
            lesson = await this.loadLessonData(id);

        if (success) {
            const cards = response.filter((card) => !!card.publishedAt);
            this.props.setForcePublishedPreviewUpdate();
            this.setState({
                cards,
                lesson,
            });

            return cards.length;
        }

        return 0;
    };

    loadLessonData = async (id) => {
        const { success, response } = await apiCall('GET', `/courses/lessons/${id}`);

        if (success) {
            return response;
        }

        return {};
    };

    render() {
        const { course, chapter } = this.props,
            { lesson, cards } = this.state,
            { feedback } = this.state,
            LessonContainer = lesson.lessonLayout === 'PAGE' ? PageContainer : CardContainer,
            contextValue = { ...lesson, cards, feedback, setFeedback: this.setFeedback, isAdminPreview: true };

        if (!lesson.lessonType) {
            return <></>;
        }

        return (
            <CourseContext.Provider value={{ data: course, isAdminPreview: true }}>
                <LessonContext.Provider value={contextValue}>
                    <LessonContainer lesson={contextValue} chapter={chapter} />
                </LessonContext.Provider>
            </CourseContext.Provider>
        );
    }
}
