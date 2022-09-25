import React from 'react';
import BaseCard from './BaseCard';
import { Modal, Row, Col, FormGroup, Form, Button, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ExamForm from '../../ExamForm';
import ThemeOptions from './ThemeOptions';

export default class QuizCard extends BaseCard {
    constructor(props) {
        super(props);
        this.state = {
            theme: props.theme ?? '',
            quizId: props.quizId ?? '',
            showModal: false,
            quizType: props.quizType ?? 'inline',
        };
    }

    toggleShowModal = () => {
        this.setState({
            showModal: !this.state.showModal,
        });
    };

    render() {
        const {
            state: { showModal, theme, quizType },
            props: { orderIndex, cardId },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} orderIndex={orderIndex} handleInputChange={this.handleInputChange} />
                <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                    <label htmlFor={`quizType-${orderIndex}`}>Quiz Type</label>
                    <select
                        name='quizType'
                        id={`quizType-${orderIndex}`}
                        value={quizType}
                        onChange={this.handleInputChange}
                    >
                        <option value='inline'>Inline Quiz</option>
                        <option value='modal'>Modal Pop-up quiz</option>
                    </select>
                </Col>
                <Col>
                    <Button onClick={this.toggleShowModal}>Edit</Button>
                </Col>
                <Modal
                    style={{ maxHeight: 'calc(100vh - 60px)' }}
                    show={showModal}
                    onHide={this.toggleShowModal}
                    backdrop='static'
                    keyboard={false}
                    dialogClassName='modal-90w'
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Quiz</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <ExamForm
                            type='Quiz'
                            handleQuizChange={this.handleQuizChange}
                            hideQuizModal={this.toggleShowModal}
                            cardId={cardId}
                        />
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
