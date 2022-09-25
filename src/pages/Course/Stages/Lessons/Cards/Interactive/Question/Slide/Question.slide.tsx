import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { Api } from 'src/helpers/new';
import { SingleQuestion, BooleanAnswer, SwitchChoice, FillGap } from './QuestionTypes';
import './Question.slide.scss';

import { EventBus } from 'src/helpers/new';
import { QuestionContext } from './QuestionContext';
import LessonContext from 'src/pages/Course/Stages/Lessons/LessonContext';

interface IRouteProps {
    lessonId: string;
}

interface IState {
    bgColor?: string;
    fgColor?: string;
    questionType?: string;
    questions?: string;
    multipleAnswers?: boolean;
    questionResults?: any;
    result?: boolean;
    userAnswers?: any;
}

interface IProps {
    cardIndex?: string;
    heading?: string;
    subHeading?: string;
    nextCardAvailable?: string;
    setNextCardAvailable?: string;
    bgColor?: string;
    fgColor?: string;
    questions?: any;
    questionAttempt?: any;
    id?: string;
    detailedQuestion?: string;
    questionType?: string;
    correctFeedback?: string;
    incorrectFeedback?: string;
    content?: string;
    updateBlockingCardIndex?: string;
    result?: any;
    userAnswers?: any;
}

export type TProps = IProps & RouteComponentProps<IRouteProps>;

class QuestionSlide extends Component<TProps, IState> {
    static contextType = LessonContext;

    isMultipleAnswers = (questions: any) => {
        if (questions) {
            if (questions?.[0]?.answer.length === 1) {
                return false;
            }
        }
        return true;
    };

    state: IState = {
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
                    (userAnswers: any, q: any, index: any) => Object.assign({}, userAnswers, { [index]: [0] }),
                    {}
                ),
            });
        }
        EventBus.on('base-question-card-retry', this.retry);
        EventBus.on('check-answer-event', this.checkAnswers);
        EventBus.dispatch('disable-button', {
            disabled: 'You must answer this question correctly in other to progress any further',
        });
    }

    componentWillUnmount() {
        EventBus.remove('base-question-card-retry', this.retry);
        this.context.setFeedback({
            expanded: false,
            show: false,
        });
    }

    componentDidUpdate(prevProps: IProps) {
        const newState: any = {};

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
                          (userAnswers: any, q: any, index: any) => Object.assign({}, userAnswers, { [index]: [0] }),
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

    retry = () => {
        this.setState(
            {
                result: false,
                userAnswers:
                    this.props.questionType === 'SWITCH_CHOICE'
                        ? this.props.questions.reduce(
                              (userAnswers: any, q: any, index: any) =>
                                  Object.assign({}, userAnswers, { [index]: [0] }),
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

    isOptionSelectedAnswer = (questionIndex: number, optionIndex: number) =>
        this.state?.questionResults?.[questionIndex]?.userAnswer?.findIndex?.(
            (userAnswer: any) => userAnswer.answer === optionIndex
        ) !== -1;

    isOptionSelected = (questionIndex: number, optionIndex: number) =>
        this.state?.userAnswers?.[questionIndex]?.includes(optionIndex);

    getSelectedOption = (questionIndex: number) => this.state?.userAnswers?.[questionIndex]?.[0] ?? 0;

    isSelectedCorrect = (questionIndex: number, optionIndex: number) => {
        const option = this.state?.questionResults?.[questionIndex]?.userAnswer?.find?.(
            (userAnswer: any) => userAnswer.answer === optionIndex
        );

        if (option === undefined) {
            return '';
        }

        return option.isCorrect ? 'correct' : 'incorrect';
    };

    selectAnswer = (questionIndex: any, e: any, value: any) => {
        if (value === undefined) {
            value = parseInt(e.target.value);
        }

        if (!this.state.questionResults.length) {
            const userAnswers = this.state.userAnswers;

            if (!this.state.multipleAnswers) {
                userAnswers[questionIndex] = [value];
            } else {
                const questionAnswer = userAnswers[questionIndex] ?? [],
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
        const payload = {
                answers: this.state.userAnswers,
                userLessonId: this.props.match.params.lessonId,
            },
            { success, response } = await Api.call(
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
                        // this.context.setLessonCardQuestionAttempt(
                        //     { cardIndex, questionAttempt: response },
                        //     this.props?.updateBlockingCardIndex
                        // );
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

    getResultIcon = (questionIndex: number, optionIndex: number) => {
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
            // <div className={`base-question-card-component${this.props.detailedQuestion ? ' detailed' : ''}`}>
            <>
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
                    }}
                >
                    {this.renderQuestionCard()}
                    {/* <div className={`check-answer-container`}>
                        {!this.state.questionResults.length && (
                            <button onClick={this.checkAnswers}>
                                Check Answer{this.state.multipleAnswers ? '' : 's'}
                            </button>
                        )}
                    </div> */}
                </QuestionContext.Provider>
            </>
            // </div>
        );
    }
}

export default withRouter(QuestionSlide);
