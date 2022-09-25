import { Modal, Row, Col, FormGroup, Form, Button, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import React, { Component } from 'react';
import './QuestionsModal.scss';
import Countdown from 'react-countdown';
import DownloadButton from './DownloadButton';
import humanizeDuration from 'humanize-duration';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import FillGapQuestion from './FillGapQuestion';
export default class QuestionsModal extends Component {
    state = {
        showTimeOut: false,
        showLeave: false,
    };

    handleTimeout = () => {
        this.setState({
            showTimeout: true,
        });
    };

    toggleLeave = () => {
        this.setState({
            showLeave: !this.state.showLeave,
        });
    };

    paddingZero = (number) => {
        if (number.toString().length === 1) {
            return `0${number}`;
        }

        return number;
    };

    handlePause = () => {
        this.props.onPause();
        this.toggleLeave();
    };

    componentDidMount() {
        if (this.props.timeLimit < Date.now()) {
            this.handleTimeout();
        }
    }

    rand(items) {
        return items[(items.length * Math.random()) | 0];
    }

    get timeSpent() {
        return humanizeDuration(this.props.attempt?.spentTime * 60000, { round: true });
    }

    render() {
        const props = this.props;
        const { passed, results, percentageScore, score, totalMarks } = props?.attempt?.results ?? {};

        return (
            <div className={props.exam ? 'questions-modal' : ''}>
                <ConditionalWrapper
                    condition={!props.exam}
                    wrapper={(children) => (
                        <Modal
                            className='questions-modal'
                            onHide={props.readOnly ? props.onHide : () => {}}
                            show={!!props.title}
                            size='xl'
                        >
                            {children}
                        </Modal>
                    )}
                >
                    {!props.exam && props.title && (
                        <Modal.Title>
                            {props.readOnly && <b>Your last attempt&apos;s anwers&nbsp;-&nbsp;</b>}
                            {props.title}
                        </Modal.Title>
                    )}
                    <Modal.Body>
                        <div>
                            {props.questions.map((question, questionIndex) => {
                                return (
                                    <Row key={questionIndex} className='pt-0 pb-2'>
                                        <Col>
                                            {question.title.includes('___') ? (
                                                <FillGapQuestion
                                                    {...question}
                                                    answer={props.answers[questionIndex]}
                                                    prepend={`${questionIndex + 1}. `}
                                                    onAnswer={
                                                        !this.props.readOnly
                                                            ? (userAnswer) => props.onAnswer(questionIndex, userAnswer)
                                                            : null
                                                    }
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
                                                                className={{
                                                                    'questions-modal--option': true,
                                                                    'questions-modal--option__valid':
                                                                        optionIndex ===
                                                                            props.questions[questionIndex]
                                                                                ?.correctOptionIdx && props.readOnly,
                                                                    'questions-modal--option__chosen':
                                                                        props.answers[questionIndex] === optionIndex &&
                                                                        props.readOnly,
                                                                }}
                                                                onChange={
                                                                    !this.props.readOnly
                                                                        ? () =>
                                                                              props.onAnswer(questionIndex, optionIndex)
                                                                        : null
                                                                }
                                                                readOnly={props.readOnly}
                                                                checked={props.answers[questionIndex] === optionIndex}
                                                            />
                                                        );
                                                    })}
                                                </FormGroup>
                                            )}
                                            {props.readOnly && (
                                                <Alert variant={results[questionIndex].correct ? 'success' : 'warning'}>
                                                    <Alert.Heading>
                                                        {results[questionIndex].correct
                                                            ? 'Correct answer!'
                                                            : 'Wrong answer'}
                                                    </Alert.Heading>
                                                    <div>
                                                        {results[questionIndex].correct
                                                            ? question.msgIfCorrect
                                                            : question.msgIfWrong}
                                                    </div>
                                                </Alert>
                                            )}
                                            <hr />
                                        </Col>
                                    </Row>
                                );
                            })}
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div>{props.error && <Alert variant='warning'>{props.error}</Alert>}</div>
                        <div>
                            <div>
                                {props.readOnly ? (
                                    [
                                        <span key='text'>
                                            {`You have scored ${percentageScore}% (${score}/${totalMarks}) in ${this.timeSpent}`}
                                        </span>,
                                    ]
                                ) : (
                                    <div>
                                        <span>You have answered </span>
                                        {this.props.answers.filter((answer) => answer !== null).length} /&nbsp;
                                        {this.props.questions.length}
                                    </div>
                                )}
                            </div>
                            {!props.readOnly && (
                                <div>
                                    <span>Time remaining:&nbsp;</span>
                                    <Countdown
                                        date={props.timeLimit}
                                        onComplete={this.handleTimeout}
                                        renderer={({ hours, minutes, seconds, completed }) => {
                                            return (
                                                <span>
                                                    {this.paddingZero(hours)}:{this.paddingZero(minutes)}:
                                                    {this.paddingZero(seconds)}
                                                </span>
                                            );
                                        }}
                                    />
                                </div>
                            )}
                            {props.readOnly ? (
                                <div>
                                    <DownloadButton attempt={this.props.attempt} />
                                    <Button className='bd' onClick={props.onHide}>
                                        Close
                                    </Button>
                                </div>
                            ) : (
                                <div className='qm-buttons'>
                                    {!props.exam && <span onClick={this.toggleLeave}>Leave</span>}
                                    <ConditionalWrapper
                                        condition={
                                            (props.answers.filter((answer) => answer !== null).length !==
                                                props.questions.length &&
                                                !props.allowSkip) ||
                                            props.questions.length !== props.answers.length
                                        }
                                        wrapper={(children) => (
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id={`tooltip-submit`}>
                                                        {'You must answer all questions'}
                                                    </Tooltip>
                                                }
                                            >
                                                {children}
                                            </OverlayTrigger>
                                        )}
                                    >
                                        <Button
                                            className={{
                                                bp: props.questions.length === props.answers.length,
                                                bd:
                                                    (props.answers.filter((answer) => answer !== null).length !==
                                                        props.questions.length &&
                                                        !props.allowSkip) ||
                                                    props.questions.length !== props.answers.length,
                                            }}
                                            onClick={(e) => {
                                                if (
                                                    (props.answers.filter((answer) => answer !== null).length !==
                                                        props.questions.length &&
                                                        !props.allowSkip) ||
                                                    props.questions.length !== props.answers.length
                                                ) {
                                                    e.preventDefault();
                                                } else {
                                                    this.props.onSubmit();
                                                }
                                            }}
                                        >
                                            Submit
                                        </Button>
                                    </ConditionalWrapper>
                                </div>
                            )}
                        </div>
                    </Modal.Footer>
                    <Modal className='qm-timeout' show={this.state.showTimeout} onHide={() => {}}>
                        <Modal.Body>
                            <center>Your time has expired</center>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button className='bp' onClick={props.onSubmit}>
                                Submit
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal className='qm-leave' show={this.state.showLeave} onHide={() => {}}>
                        <Modal.Body>
                            <center>You are about to leave an ongoing quiz, are you sure you want to proceed?</center>
                        </Modal.Body>
                        <Modal.Footer>
                            <ConditionalWrapper
                                condition={!props.answers.length}
                                wrapper={(children) => (
                                    <OverlayTrigger
                                        overlay={
                                            <Tooltip id={`tooltip-submit`}>
                                                You must answer at least one question to be able to resume later
                                            </Tooltip>
                                        }
                                    >
                                        {children}
                                    </OverlayTrigger>
                                )}
                            >
                                <Button
                                    className={`${!props.answers.length ? 'bd' : 'bp'} mr-auto`}
                                    onClick={(e) => {
                                        if (!props.answers.length) {
                                            e.preventDefault();
                                        } else {
                                            this.handlePause();
                                        }
                                    }}
                                >
                                    Save & resume later
                                </Button>
                            </ConditionalWrapper>
                            <Button className='bd' onClick={this.toggleLeave}>
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </ConditionalWrapper>
            </div>
        );
    }
}
