import React, { Component } from 'react';
import { FormGroup, Form, Modal, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { LessonContext } from '../../LessonContext';
import FillGapQuestion from '../../QuestionsModal/FillGapQuestion';
import Countdown from 'react-countdown';
import ConditionalWrapper from '../../../../components/ConditionalWrapper';
import './CardsQuiz.scss';

export default class CardsQuiz extends Component {
    static contextType = LessonContext;

    state = {
        showTimeout: false,
        showLeave: false,
    };

    toggleLeave = () => {
        this.setState({
            showLeave: !this.state.showLeave,
        });
    };

    handlePause = () => {
        this.props.onPause();
        this.context.setCardsQuizState({ isInQuiz: false });
        this.toggleLeave();
    };

    componentDidMount() {
        const { questions, timeLimit, allowSkip, answers, onSubmit } = this.props;

        if (timeLimit < Date.now()) {
            this.handleTimeout();
        }

        this.context.setCardsQuizState({
            allowSkip,
            answers,
            onSubmit,
            isInQuiz: true,
            questionsLength: questions.length,
            questionIndex: 0,
        });
    }

    componentDidUpdate(prevProps) {
        if (this.props.quizId !== prevProps.quizId) {
            const { questions, allowSkip, answers } = this.props;

            this.context.setCardsQuizState({
                allowSkip,
                answers,
                isInQuiz: true,
                questionsLength: questions.length,
                questionIndex: 0,
            });
        }
    }

    handleTimeout = () => {
        this.setState({
            showTimeout: true,
        });
    };

    handleAnswer = (questionIndex, userAnswer) => {
        let { answerInc = 0, answers } = this.context.cardsQuiz;

        if (typeof answers[questionIndex] !== 'number') {
            answerInc++;
        }

        answers[questionIndex] = userAnswer;

        this.context.setCardsQuizState({
            answerInc,
            answers,
        });

        this.props.onAnswer(questionIndex, userAnswer);
    };

    render() {
        const { questions, answers, timeLimit, onSubmit } = this.props,
            { showTimeout, showLeave } = this.state,
            { questionIndex = 0 } = this.context.cardsQuiz,
            question = questions[questionIndex];

        return (
            <>
                <div className='cards-quiz'>
                    <header>
                        <div className='cards-quiz__tracker'>
                            <span>You have answered </span>
                            <strong>{answers.filter((answer) => answer !== null).length}</strong> / {questions.length}
                        </div>
                        <div className='cards-quiz__timer'>
                            <div className='bd' onClick={this.toggleLeave}>
                                Leave
                            </div>
                            <span>Time remaining:&nbsp;</span>
                            <Countdown
                                date={timeLimit}
                                onComplete={this.handleTimeout}
                                renderer={({ hours, minutes, seconds, completed }) => {
                                    return (
                                        <span>
                                            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:
                                            {seconds.toString().padStart(2, '0')}
                                        </span>
                                    );
                                }}
                            />
                        </div>
                    </header>
                    <div>
                        {question.title.includes('___') ? (
                            <FillGapQuestion
                                {...question}
                                answer={answers[questionIndex]}
                                prepend={`${questionIndex + 1}. `}
                                onAnswer={(userAnswer) => this.handleAnswer(questionIndex, userAnswer)}
                            />
                        ) : (
                            <FormGroup>
                                <Form.Label className='pb-2'>
                                    {questionIndex + 1}. {question.title}
                                </Form.Label>
                                {question.options.map((option, optionIndex) => {
                                    return (
                                        <Form.Check
                                            key={optionIndex}
                                            id={`Q${questionIndex}A${optionIndex}`}
                                            type='radio'
                                            name={option.title}
                                            label={option}
                                            className='cards-quiz--option'
                                            onChange={() => this.handleAnswer(questionIndex, optionIndex)}
                                            checked={answers[questionIndex] === optionIndex}
                                        />
                                    );
                                })}
                            </FormGroup>
                        )}
                    </div>
                </div>
                <Modal className='qm-timeout' show={showTimeout} onHide={() => {}}>
                    <Modal.Body>
                        <center>Your time has expired</center>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button className='bp' onClick={onSubmit}>
                            Submit
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal className='qm-leave' show={showLeave} onHide={() => {}}>
                    <Modal.Body>
                        <center>You are about to leave an ongoing quiz, are you sure you want to proceed?</center>
                    </Modal.Body>
                    <Modal.Footer>
                        <ConditionalWrapper
                            condition={!answers.length}
                            wrapper={(children) => (
                                <OverlayTrigger
                                    overlay={
                                        <Tooltip id={`tooltip-submit`}>
                                            You must answer at least one question to be able to resume later
                                        </Tooltip>
                                    }>
                                    {children}
                                </OverlayTrigger>
                            )}>
                            <Button
                                className={`${!answers.length ? 'bd' : 'bp'} mr-auto`}
                                onClick={(e) => {
                                    if (!answers.length) {
                                        e.preventDefault();
                                    } else {
                                        this.handlePause();
                                    }
                                }}>
                                Save & resume later
                            </Button>
                        </ConditionalWrapper>
                        <Button className='bd' onClick={this.toggleLeave}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }
}
