import React, { Component } from 'react';
import AdminLessonContext from '../AdminLessonContext';

export default class BaseCard extends Component {
    static contextType = AdminLessonContext;

    componentDidMount() {
        if (this.state !== null) {
            const { orderIndex, cardId: _id, cardType, cardTitle } = this.props,
                { isPopupVisible: dump, ...state } = this.state;
            this.context.handleLessonChange('card', {
                ...state,
                cardTitle,
                lessonId: this.context.lesson._id,
                orderIndex,
                cardType,
                _id,
            });
        }
    }

    dispatchLessonChange = () => {
        const { orderIndex, cardId: _id, cardType, cardTitle } = this.props,
            { isPopupVisible: dump, ...state } = this.state;

        this.context.handleLessonChange(
            'card',
            {
                ...state,
                cardTitle,
                lessonId: this.context.lesson._id,
                orderIndex,
                cardType,
                _id,
            },
            this.context.enableSaveButton
        );
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState(
            {
                [input.name]: input.value,
            },
            this.dispatchLessonChange
        );
    };

    handleCheckboxClick = (e) => {
        this.setState(
            {
                [e.target.name]: !this.state[e.target.name],
            },
            this.dispatchLessonChange
        );
    };

    render() {
        return <></>;
    }
}
