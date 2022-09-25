import React, { Component } from 'react';
import LessonCard from './LessonCard';
import { Col, Form, FormGroup, Row, Button, Badge } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Spinner } from '../../components/Spinner';

export default class LessonFormElement extends Component {
    render() {
        if (!this.props.editable && !this.props.published) {
            return 'This Lesson has not been published yet.';
        }

        const hasQuiz = this.props.cards.some((card) => {
            return card.cardType === 'QUIZ';
        });

        return (
            <Form onSubmit={this.props.parent.handleSubmit} id={this.props.editable ? 'lessonForm' : ''}>
                {this.props.editable ? (
                    <Row className='pt-4'>
                        <Col md={6}>
                            {this.props.parent.state.minsAgo !== null ? (
                                <Badge variant='light'>
                                    Last saved&nbsp;
                                    {this.props.parent.state.minsAgo === 0
                                        ? 'seconds ago'
                                        : this.props.parent.state.minsAgo === 1
                                        ? '1 minute ago'
                                        : this.props.parent.state.minsAgo + ' minutes ago'}
                                    .
                                </Badge>
                            ) : (
                                <></>
                            )}
                        </Col>
                    </Row>
                ) : (
                    <></>
                )}

                <Row className='pt-5'>
                    <Col md={7}>
                        <Row>
                            <Col md={7}>
                                <FormGroup>
                                    <Form.Label htmlFor='title'>Lesson Name</Form.Label>
                                    <Form.Control
                                        type='text'
                                        required
                                        minLength='3'
                                        maxLength='512'
                                        id='title'
                                        name='title'
                                        value={this.props.lesson.title || ''}
                                        onChange={this.props.parent.handleChange}
                                        readOnly={!this.props.editable || this.props.lesson.submissionInProgress}
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={5}>
                                <Form.Label htmlFor='maxTime'>Progress Time (mins)</Form.Label>
                                <Form.Control
                                    type='number'
                                    id='maxTime'
                                    name='maxTime'
                                    min='0'
                                    value={this.props.lesson.maxTime || 0}
                                    onChange={this.props.parent.handleChange}
                                    readOnly={!this.props.editable || this.props.lesson.submissionInProgress}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col md={7}>
                                <Form.Label htmlFor='unlockNextLesson'>Unlock next lesson</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='unlockNextLesson'
                                    name='unlockNextLesson'
                                    value={this.props.lesson.unlockNextLesson || ''}
                                    onChange={this.props.parent.handleChange}
                                    readOnly={
                                        !this.props.editable || this.props.parent.state.lessonsubmissionInProgress
                                    }
                                >
                                    <option value='ALWAYS_UNLOCKED'>All time</option>
                                    <option value='ON_LESSON_START'>When started</option>
                                    <option value='REQUIRED_TIME_MET'>When Timer Met</option>
                                    <option disabled={!hasQuiz} value='ON_QUIZ_START'>
                                        When Quiz Started
                                    </option>
                                    <option disabled={!hasQuiz} value='ON_QUIZ_END'>
                                        When Quiz Finished
                                    </option>
                                    <option disabled={!hasQuiz} value='ON_QUIZ_PASS'>
                                        When Quiz Passed
                                    </option>
                                </Form.Control>
                            </Col>
                            <Col md={5}>
                                <Form.Label htmlFor='requiredTime'>Required Time (mins)</Form.Label>
                                <Form.Control
                                    type='number'
                                    id='requiredTime'
                                    name='requiredTime'
                                    min='0'
                                    value={this.props.lesson.requiredTime || 0}
                                    onChange={this.props.parent.handleChange}
                                    readOnly={!this.props.editable || this.props.lesson.submissionInProgress}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <Form.Label htmlFor='lessonLayout'>Lesson Layout</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='lessonLayout'
                                    name='lessonLayout'
                                    value={this.props.lesson.lessonLayout || 'CARD'}
                                    onChange={this.props.parent.handleChange}
                                    readOnly={
                                        !this.props.editable || this.props.parent.state.lessonsubmissionInProgress
                                    }
                                >
                                    <option value='PAGE'>Page</option>
                                    <option value='CARD'>Card</option>
                                </Form.Control>
                            </Col>
                        </Row>
                    </Col>
                    <Col md={5}>
                        <Row>
                            <Col>
                                <Form.Label htmlFor='lessonType'>Lesson Type</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='lessonType'
                                    name='lessonType'
                                    value={this.props.lesson.lessonType || ''}
                                    onChange={this.props.parent.handleChange}
                                    readOnly={
                                        !this.props.editable || this.props.parent.state.lessonsubmissionInProgress
                                    }
                                >
                                    <option value='BASIC'>Basic</option>
                                    <option value='STATE'>State</option>
                                    <option value='NATIONAL'>National</option>
                                </Form.Control>
                            </Col>
                        </Row>
                        <Row>
                            {'lessonType' in this.props.lesson && this.props.lesson.lessonType !== 'BASIC' && (
                                <Col>
                                    <FormGroup>
                                        <Form.Label htmlFor='lessonTypeComment'>Lesson Description</Form.Label>
                                        <Form.Control
                                            as='textarea'
                                            type='text'
                                            rows='4'
                                            id='lessonTypeComment'
                                            name='lessonTypeComment'
                                            value={this.props.lesson.lessonTypeComment || ''}
                                            onChange={this.props.parent.handleChange}
                                            readOnly={!this.props.editable || this.props.lesson.submissionInProgress}
                                        />
                                    </FormGroup>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>

                <Row className='pt-5'>
                    <Col>
                        <FormGroup>
                            <Form.Label>Content</Form.Label>
                        </FormGroup>
                    </Col>
                </Row>

                {this.props.lessonCardsLoading ? (
                    <Spinner />
                ) : (
                    <DragDropContext onDragEnd={this.props.parent.handleDragAndDrop}>
                        <Droppable droppableId='lessonCardsDroppable'>
                            {(provided) => (
                                <ul
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={{
                                        listStyleType: 'none',
                                        padding: '0px',
                                        margin: '0px',
                                    }}
                                >
                                    {!this.props.cards.length ? (
                                        <Button variant='btn bd' type='button' onClick={this.props.parent.addNewCard}>
                                            Add new Card
                                        </Button>
                                    ) : (
                                        <></>
                                    )}
                                    {this.props.cards.map((card, i) => {
                                        return (
                                            <Draggable
                                                key={`draggable-${card.uuid}`}
                                                draggableId={card.uuid}
                                                index={i}
                                                isDragDisabled={!this.props.editable}
                                            >
                                                {(provided) => (
                                                    <li ref={provided.innerRef} {...provided.draggableProps}>
                                                        <Row key={card.uuid}>
                                                            <Col>
                                                                <LessonCard
                                                                    editable={this.props.editable}
                                                                    card={
                                                                        this.props.editable
                                                                            ? { ...card, ...card.draft }
                                                                            : card
                                                                    }
                                                                    idx={i}
                                                                    deleteItem={this.props.parent.deleteItem}
                                                                    dragHandleProps={provided.dragHandleProps}
                                                                    manualIdxChange={this.props.parent.manualIdxChange}
                                                                    numOfCards={this.props.cards.length}
                                                                    addNewCard={this.props.parent.addNewCard}
                                                                    updateDraftUpdateTs={this.props.updateDraftUpdateTs}
                                                                    handleCardChange={
                                                                        this.props.parent.handleCardChange
                                                                    }
                                                                    handleFileChange={
                                                                        this.props.parent.handleFileChange
                                                                    }
                                                                />
                                                            </Col>
                                                        </Row>
                                                    </li>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                )}
            </Form>
        );
    }
}
