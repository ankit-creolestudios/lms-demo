import React, { Component } from 'react';
import { withRouter } from 'react-router';
import apiCall from '../../../../../helpers/apiCall';
import { SingleQuestion, BooleanAnswer } from '.';
import { QuestionContext } from './QuestionContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import EventBus from '../../../../../helpers/eventBus';
import './BaseQuestionCard.scss';
import FillGap from './FillGap';
import { LessonContext } from '../../../LessonContext';
import SwitchChoice from './SwitchChoice';
import CardButtons from '../../../../../components/CardButtons';

class BaseQuestionCard extends Component {
    static contextType = LessonContext;

    isMultipleAnswers = (questions) => {
        if (questions) {
            if (questions?.[0]?.answer.length === 1) {
                return false;
            }
        }
        return true;
    };

    state = {
        bgColor: '#25255e',
        fgColor: 'white',
        questionType: this.props.questionType ?? 'SINGLE_QUESTION',
        questions: this.props.questions ?? [],
        multipleAnswers: this.isMultipleAnswers(this.props.questions),
        questionResults:
            this.props?.questionAttempt && this.props?.questionAttempt?.status !== 'passed'
                ? this.props?.questionAttempt?.questions ?? []
                : [],
        result: this.props?.questionAttempt && this.props?.questionAttempt?.status === 'passed',
        userAnswers: {},
        infoOpen: false,
    };

    componentDidMount() {
        if (this.context.setFeedback) {
            if (!this.props?.questionAttempt?.status || this.props?.questionAttempt?.status === 'passed') {
                this.context.setFeedback({
                    expanded: false,
                    show: false,
                });
            } else {
                if (this.props.questionAttempt) {
                    this.context.setFeedback({
                        correct: false,
                        show: true,
                        title: "That's not quite right",
                        content: this.props.incorrectFeedback,
                        expanded: false,
                        nextCardAvailable: this.props.nextCardAvailable,
                    });
                }
            }
        }
        if (this.props.questionType === 'SWITCH_CHOICE') {
            this.setState({
                userAnswers: this.props.questions.reduce(
                    (userAnswers, q, index) => Object.assign({}, userAnswers, { [index]: [0] }),
                    {}
                ),
            });
        }
        EventBus.on('base-question-card-retry', this.retry);
    }

    componentWillUnmount() {
        EventBus.remove('base-question-card-retry', this.retry);
        this.context.setFeedback({
            expanded: false,
            show: false,
        });
    }

    componentDidUpdate(prevProps) {
        const newState = {};

        if (JSON.stringify(prevProps.result) !== JSON.stringify(this.props.result)) {
            newState.result = this.props.result;
        }

        if (JSON.stringify(prevProps.userAnswers) !== JSON.stringify(this.props.userAnswers)) {
            newState.userAnswers = this.props.userAnswers;
        }

        if (JSON.stringify(prevProps.id) !== JSON.stringify(this.props.id)) {
            if (this.context.setFeedback) {
                if (!this.props?.questionAttempt?.status || this.props?.questionAttempt?.status === 'passed') {
                    this.context.setFeedback({
                        expanded: false,
                        show: false,
                    });
                } else {
                    if (this.props.questionAttempt) {
                        this.context.setFeedback({
                            correct: false,
                            show: true,
                            title: "That's not quite right",
                            content: this.props.incorrectFeedback,
                            expanded: false,
                            nextCardAvailable: this.props.nextCardAvailable,
                        });
                    }
                }
            }

            newState.questions = this.props.questions;
            newState.result = this.props?.questionAttempt?.status === 'passed';
            newState.questionResults = !newState.result ? this.props?.questionAttempt?.questions ?? [] : [];
            newState.multipleAnswers = this.isMultipleAnswers(this.props.questions);
            newState.userAnswers =
                this.props.questionType === 'SWITCH_CHOICE'
                    ? this.props.questions.reduce(
                          (userAnswers, q, index) => Object.assign({}, userAnswers, { [index]: [0] }),
                          {}
                      )
                    : {};
        }

        if (prevProps.questionType !== this.props.questionType) {
            newState.questionType = this.props.questionType;
        }

        if (Object.keys(newState).length !== 0) {
            this.setState(newState);
        }
    }

    toggleInfo = () => {
        this.setState({ infoOpen: !this.state.infoOpen });
    };

    retry = () => {
        this.setState(
            {
                result: null,
                userAnswers:
                    this.props.questionType === 'SWITCH_CHOICE'
                        ? this.props.questions.reduce(
                              (userAnswers, q, index) => Object.assign({}, userAnswers, { [index]: [0] }),
                              {}
                          )
                        : {},
                questionResults: [],
            },
            () => {
                this.context.setFeedback({
                    expanded: false,
                    show: false,
                });
            }
        );
    };

    isOptionSelectedAnswer = (questionIndex, optionIndex) =>
        this.state?.questionResults?.[questionIndex]?.userAnswer?.findIndex?.(
            (userAnswer) => userAnswer.answer === optionIndex
        ) !== -1;

    isOptionSelected = (questionIndex, optionIndex) => this.state?.userAnswers?.[questionIndex]?.includes(optionIndex);

    getSelectedOption = (questionIndex) => this.state?.userAnswers?.[questionIndex]?.[0] ?? 0;

    isSelectedCorrect = (questionIndex, optionIndex) => {
        const option = this.state?.questionResults?.[questionIndex]?.userAnswer?.find?.(
            (userAnswer) => userAnswer.answer === optionIndex
        );

        if (option === undefined) {
            return '';
        }

        return option.isCorrect ? 'correct' : 'incorrect';
    };

    selectAnswer = (questionIndex, e, value) => {
        if (value === undefined) {
            value = parseInt(e.target.value);
        }

        if (!this.state.questionResults.length) {
            let userAnswers = this.state.userAnswers;

            if (!this.state.multipleAnswers) {
                userAnswers[questionIndex] = [value];
            } else {
                let questionAnswer = userAnswers[questionIndex] ?? [],
                    index = questionAnswer.indexOf(value);

                if (index !== -1) {
                    questionAnswer.splice(index, 1);
                } else {
                    questionAnswer.push(value);
                }

                userAnswers[questionIndex] = questionAnswer;
            }

            this.setState({ userAnswers });
        }
    };

    checkAnswers = async () => {
        let payload = {
                answers: this.state.userAnswers,
                userLessonId: this.props.match.params.lessonId,
            },
            { success, response } = await apiCall(
                'post',
                `/courses/lessons/cards/${this.props.id}/checkanswers`,
                payload
            );
        if (success) {
            const { cardIndex } = this.props,
                result = response.status === 'passed';

            this.setState(
                {
                    result: result,
                    questionResults: response.questions,
                },
                () => {
                    if (result) {
                        this.context.setFeedback({
                            correct: true,
                            show: true,
                            title: "That's correct!",
                            content: this.props.correctFeedback,
                            nextCardAvailable: this.props.nextCardAvailable,
                        });
                        this.context.setLessonCardQuestionAttempt(
                            { cardIndex, questionAttempt: response },
                            this.props?.updateBlockingCardIndex
                        );
                    } else {
                        this.context.setFeedback({
                            correct: false,
                            show: true,
                            title: "That's not quite right",
                            content: this.props.incorrectFeedback,
                            expanded: true,
                            nextCardAvailable: this.props.nextCardAvailable,
                        });
                    }
                }
            );
        }
    };

    getResultIcon = (questionIndex, optionIndex) => {
        switch (this.isSelectedCorrect(questionIndex, optionIndex)) {
            case 'correct':
                return <FontAwesomeIcon icon={faCheck} />;
            case 'incorrect':
                return <FontAwesomeIcon icon={faTimes} />;
            default:
                return <></>;
        }
    };

    renderQuestionCard = () => {
        switch (this.state.questionType) {
            case 'SINGLE_QUESTION':
                return <SingleQuestion />;
            case 'DOUBLE_CHOICE':
                return <BooleanAnswer />;
            case 'FILL_GAP':
                return <FillGap />;
            case 'SWITCH_CHOICE':
                return <SwitchChoice />;
        }
    };

    render() {
        return (
            <div className={`base-question-card-component${this.props.detailedQuestion ? ' detailed' : ''}`}>
                <QuestionContext.Provider
                    value={{
                        heading: this.props.heading,
                        subHeading: this.props.subHeading,
                        content: this.props.content,
                        questions: this.state.questions,
                        bgColor: this.state.bgColor,
                        fgColor: this.state.fgColor,
                        result: this.state.result,
                        detailedQuestion: this.props.detailedQuestion,
                        multipleAnswers: this.state.multipleAnswers,
                        questionResults: this.state.questionResults,
                        userAnswers: this.state.userAnswers,
                        selectAnswer: this.selectAnswer,
                        isOptionSelected: this.isOptionSelected,
                        isOptionSelectedAnswer: this.isSelectedCorrect,
                        isSelectedCorrect: this.isSelectedCorrect,
                        getSelectedOption: this.getSelectedOption,
                        checkAnswers: this.checkAnswers,
                        getResultIcon: this.getResultIcon,
                        retry: this.retry,
                    }}>
                    {this.props.info && (
                        <CardButtons
                            info={this.props.info}
                            toggleInfo={this.toggleInfo}
                            infoOpen={this.state.infoOpen}
                        />
                    )}
                    {this.renderQuestionCard()}
                    <div className={`check-answer-container`}>
                        {!this.state.questionResults.length && (
                            <button onClick={this.checkAnswers}>
                                Check Answer{this.state.multipleAnswers ? '' : 's'}
                            </button>
                        )}
                    </div>
                </QuestionContext.Provider>
            </div>
        );
    }
}

export default withRouter(BaseQuestionCard);
