import React, { Component } from 'react';
import { Api, EventBus } from 'src/helpers/new';
import LessonContext from 'src/pages/Course/Stages/Lessons/LessonContext';
import Question from '../../Question/Question';
import { IQuiz } from '../Quiz.page';
import './Inline.quiz.scss';

interface IProps {
    quiz: IQuiz;
    cardId: string;
    quizAttempts: any[];
    quizPassed: boolean;
    lastAttempt: any;
}

interface IQuestion {
    correctOptionIdx?: number;
    marksIfCorrect?: any;
    marksIfSkipped?: any;
    marksIfWrong?: any;
    msgIfCorrect?: string;
    msgIfWrong?: string;
    options: string[];
    title: string;
}

type TAnswer = null | any;
interface IState {
    quiz: IQuiz | null;
    userAnswers: TAnswer[];
    results: Record<string, boolean>[];
    answers: number[];
    passed: boolean | null;
}

export default class InlineQuiz extends Component<IProps, IState> {
    static contextType = LessonContext;
    constructor(props: IProps) {
        super(props);

        this.state = {
            quiz: props.quiz,
            userAnswers: props?.lastAttempt?.answers ?? new Array(props.quiz?.questions?.length ?? 0).fill(null),
            results: props?.lastAttempt?.results ?? [],
            answers: [],
            passed: props.quizPassed ? true : props.quizAttempts.length > 0 ? false : null,
        };
    }

    handleAnswer = (answer: number, questionNumber: number) => {
        const userAnswers = Array.from(this.state.userAnswers);
        userAnswers[questionNumber - 1] = answer;

        this.setState({
            userAnswers,
        });
    };

    checkAnswers = async () => {
        const { userAnswers } = this.state;
        const { _id } = this.props.quiz;

        const { success, response } = await Api.call('post', `users/Lessonquizzes/${_id}/checkanswers/inline/`, {
            lessonId: this.context.lesson._id,
            lessonCardId: this.props.cardId,
            userAnswers,
        });

        if (success) {
            this.setState({
                results: response.results,
                answers: response.answers ?? [],
                passed: response.passed,
            });
            // causes the progression manager to remount, causes the lesson unlock/completion if it's based on exam requirements
            EventBus.dispatch('re-enter-lesson');
        }
    };

    retry = () => {
        const userAnswers = new Array(this.props.quiz.questions.length ?? 0).fill(null);

        this.setState({
            results: [],
            userAnswers,
            passed: null,
        });
    };

    get userCanRetry() {
        const { quiz, passed } = this.state;

        switch (quiz?.allowReattempt) {
            case 'never':
                return false;
            case 'always':
                return true;
            case 'on_fail':
                return !passed;
            default:
                return false;
        }
    }

    render() {
        const { quiz, results, userAnswers, answers, passed } = this.state;

        if (!quiz) {
            return <></>;
        }
        const { questions } = quiz;

        return (
            <div className='inline-quiz'>
                <h1>{quiz.title}</h1>
                <div className='questions'>
                    {questions.map((question: IQuestion, index: number) => {
                        return (
                            <Question
                                key={index}
                                questionNumber={index + 1}
                                handleAnswer={this.handleAnswer}
                                question={question}
                                result={results[index]}
                                selectedAnswer={userAnswers[index]}
                                answer={quiz.revealAnswers !== 'never' ? answers[index] : undefined}
                                questionIndex={index}
                                readOnly={passed !== null}
                            />
                        );
                    })}
                </div>
                {passed === null && <button onClick={this.checkAnswers}>Submit Answers</button>}
                {passed !== null && this.userCanRetry && <button onClick={this.retry}>Retry</button>}
            </div>
        );
    }
}
