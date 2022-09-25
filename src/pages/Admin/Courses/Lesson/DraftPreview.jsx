import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
import { CourseContext } from '../../../Courses/CourseContext';
import { CardContainer, PageContainer } from '../../../Courses/LessonContainers';
import { LessonContext } from '../../../Courses/LessonContext';

export default class DraftPreview extends Component {
    state = {
        feedback: {
            show: false,
            expanded: false,
        },
        lesson: this.props.lesson,
        cards: this.props.cards,
    };

    componentDidMount = async () => {
        await this.loadLessonAndCards();
    };

    componentDidUpdate = async (prevProps) => {
        if (prevProps.currentLessonId !== this.props.currentLessonId) {
            await this.loadLessonAndCards();
        }
    };

    loadLessonAndCards = async () => {
        await this.fetchLessonCards();
        await this.fetchLesson();
    };

    fetchLessonCards = async () => {
        const { success, response } = await Api.call(
            'GET',
            `/${this?.props?.match?.params?.coreId ? 'core' : 'courses'}/lessons/${this.props.lesson?._id}/cards`
        );
        if (success) {
            const newCards = [...response];
            for (const i in newCards) {
                let newCard = newCards[i];
                newCard = { ...newCard, ...newCard.draft };
                newCards.splice(i, 1, newCard);
            }
            this.setState({
                cards: newCards,
            });
        }
    };

    fetchLesson = async () => {
        const { success, response } = await Api.call(
            'GET',
            `/${this?.props?.match?.params?.coreId ? 'core' : 'courses'}/lessons/${this.props.lesson?._id}`
        );
        if (success) {
            this.setState({
                lesson: { ...response, ...response.draft },
            });
        }
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

    render() {
        const { course, chapter } = this.props,
            { feedback, cards, lesson } = this.state,
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
