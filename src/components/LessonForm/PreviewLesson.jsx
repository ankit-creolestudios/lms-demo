import React, { Component } from 'react';
import LessonCard from '../../pages/Courses/LessonCard';
import { AiOutlineLeft, AiOutlineRight } from 'react-icons/ai';
import './PreviewLesson.scss';
import apiCall from '../../helpers/apiCall';

export default class PreviewLesson extends Component {
    state = {
        page: 0,
        cards: this.props.cards,
        nextLessonId: this.props.nextLessonId,
        previousLessonId: this.props.previousLessonId,
    };

    pageOptions = () => {
        let options = [];

        for (let i = 1; i <= this.state.cards.length; i++) {
            options.push(
                <option key={i} value={i}>
                    {i}
                </option>
            );
        }

        return options;
    };

    setCurrentLessonCard = async (page) => {
        if (page < 0) {
            const newCardsLength = await this.loadLessonCards(this.state.previousLessonId);
            page = newCardsLength - 1;
        }

        if (page > this.state.cards.length - 1) {
            await this.loadLessonCards(this.state.nextLessonId);
            page = 0;
        }

        this.setState({ page });
    };

    loadLessonCards = async (id) => {
        const { success, response } = await apiCall(
                'GET',
                `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/${id}/cards`
            ),
            { nextLessonId, previousLessonId } = await this.loadLessonData(id);

        if (success) {
            this.setState({
                cards: response,
                nextLessonId,
                previousLessonId,
            });

            return response.length;
        }

        return 0;
    };

    loadLessonData = async (id) => {
        const { success, response } = await apiCall(
            'GET',
            `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/${id}`
        );

        if (success) {
            return {
                nextLessonId: response?.nextLesson?._id,
                previousLessonId: response?.previousLesson?._id,
            };
        }

        return {};
    };

    get previousText() {
        if (this.state.page === 0) {
            return 'Previous lesson';
        }

        return 'Previous';
    }

    get nextText() {
        if (this.state.page === this.state.cards.length - 1) {
            return 'Next lesson';
        }

        return 'Next';
    }

    render() {
        const { page, cards, previousLessonId, nextLessonId } = this.state,
            currentCard = cards[page];

        return (
            <div className='lesson-preview__container'>
                <LessonCard {...currentCard} />
                <footer className='lesson-preview__controls'>
                    {!!(previousLessonId || page) && (
                        <span
                            onClick={() => {
                                this.setCurrentLessonCard(page - 1);
                            }}
                        >
                            <AiOutlineLeft /> {this.previousText}
                        </span>
                    )}
                    <div>
                        <select
                            style={{
                                width: `${cards.length.toString().length + 1.5}ch`,
                            }}
                            type='number'
                            name='page'
                            id='page'
                            value={page + 1}
                            onChange={(e) => {
                                this.setCurrentLessonCard(e.target.value);
                            }}
                        >
                            {this.pageOptions()}
                        </select>
                        <div> | {cards.length}</div>
                    </div>
                    {!!(nextLessonId || page < cards.length) && (
                        <span
                            onClick={() => {
                                this.setCurrentLessonCard(page + 1);
                            }}
                        >
                            {this.nextText}
                            <AiOutlineRight />
                        </span>
                    )}
                </footer>
            </div>
        );
    }
}
