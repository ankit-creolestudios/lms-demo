import React, { Component } from 'react';
import { Row, Col, Accordion, Card, Button, Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { ConfirmationModal } from '../../../components/ConfirmationModal';

export default class ExamQuestion extends Component {
    state = { modalShow: false };

    handleChange = (event) => {
        const name = event.target.name.split('-')[0];
        this.props.handleQuestionChange(this.props.idx, name, event.target.value);
    };

    handleOptionChange = (optIdx, newTitle) => {
        let newOptions = [...this.props.question.options];
        newOptions[optIdx] = newTitle;
        this.props.handleQuestionChange(this.props.idx, 'options', newOptions);
    };

    render() {
        const { idx } = this.props;
        return (
            <div>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    confirmAction={() => {
                        this.props.deleteQuestion(this.props.idx);
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    titleText={'Are you sure?'}
                    bodyText={['You are about to ', <strong key='modal-type'>delete</strong>, ' this Question.']}
                />

                <Accordion defaultActiveKey='1'>
                    <Card>
                        <Accordion.Toggle as={Card.Header} eventKey='0'>
                            <Row>
                                <Col xs={12} lg={2} className='my-2 my-lg-0 pt-2'>
                                    <span
                                        {...this.props.dragHandleProps}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        {this.props.handleQuizChange && !this.props.editable ? (
                                            <div></div>
                                        ) : (
                                            <FontAwesomeIcon icon={faEllipsisV} style={{ marginRight: '20px' }} />
                                        )}
                                    </span>
                                    Q{this.props.idx + 1}
                                </Col>
                                <Col xs={12} lg={8}>
                                    <Form.Control
                                        type='text'
                                        required
                                        minLength='3'
                                        maxLength='512'
                                        id={`title-${idx}`}
                                        name={`title-${idx}`}
                                        placeholder='Question title'
                                        style={{
                                            width: '90%',
                                            marginRight: '20px',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        value={this.props.question.title}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </Col>
                                {this.props.handleQuizChange && !this.props.editable ? (
                                    <Col xs={12} lg={2} className='my-2 my-md-0'></Col>
                                ) : (
                                    <Col xs={12} lg={2} className='my-2 my-md-0'>
                                        <OverlayTrigger placement='top' overlay={<Tooltip>Delete</Tooltip>}>
                                            <Button
                                                variant='link'
                                                type='button'
                                                className='float-right ml-1'
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    this.setState({
                                                        modalShow: true,
                                                    });
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger placement='top' overlay={<Tooltip>Edit</Tooltip>}>
                                            <Accordion.Toggle
                                                as={Button}
                                                variant='link'
                                                className='float-right mx-1'
                                                eventKey='0'
                                            >
                                                <FontAwesomeIcon icon={faPencilAlt} />
                                            </Accordion.Toggle>
                                        </OverlayTrigger>
                                    </Col>
                                )}
                            </Row>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey='0'>
                            <Card.Body>
                                <Row>
                                    <Col xs={7} sm={8} md={9}>
                                        <Form.Label>Options</Form.Label>
                                        {['A', 'B', 'C', 'D', 'E'].map((opt, i) => {
                                            return (
                                                <Form.Group key={`opt-${i}`}>
                                                    <Row>
                                                        <Col xs={2} md={1} className='pt-2 text-center'>
                                                            {opt}
                                                        </Col>
                                                        <Col xs={10} md={11}>
                                                            <Form.Control
                                                                type='text'
                                                                maxLength='512'
                                                                id={`choice${opt}-${idx}`}
                                                                name={`choice${opt}-${idx}`}
                                                                value={this.props.question.options[i] || ''}
                                                                onChange={(event) => {
                                                                    this.handleOptionChange(i, event.target.value);
                                                                    if (
                                                                        !event.target.value &&
                                                                        this.props.question.correctOptionIdx === i
                                                                    ) {
                                                                        this.props.handleQuestionChange(
                                                                            this.props.idx,
                                                                            'correctOptionIdx',
                                                                            null
                                                                        );
                                                                    }
                                                                }}
                                                                readOnly={
                                                                    this.props.handleQuizChange && !this.props.editable
                                                                }
                                                            />
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                            );
                                        })}
                                    </Col>
                                    <Col xs={5} sm={4} md={3}>
                                        <Form.Label>Correct Opt.</Form.Label>
                                        {['A', 'B', 'C', 'D', 'E'].map((opt, i) => {
                                            return (
                                                <Form.Group key={`opt-radio-${i}`}>
                                                    <Form.Check
                                                        style={{
                                                            height: '38px',
                                                        }}
                                                        className='pt-2'
                                                        type='radio'
                                                        label=''
                                                        name={`optradio-${
                                                            this.props.question._id || this.props.question.uuid
                                                        }`}
                                                        disabled={
                                                            !this.props.question.options[i] ||
                                                            (this.props.handleQuizChange && !this.props.editable)
                                                        }
                                                        onChange={(event) => {
                                                            if (event.target.checked) {
                                                                this.props.handleQuestionChange(
                                                                    this.props.idx,
                                                                    'correctOptionIdx',
                                                                    i
                                                                );
                                                            }
                                                        }}
                                                        checked={this.props.question.correctOptionIdx === i}
                                                    />
                                                </Form.Group>
                                            );
                                        })}
                                    </Col>
                                </Row>
                                <Row className='pt-2'>
                                    <Col md={6}>
                                        <Form.Label htmlFor={`msgIfCorrect-${idx}`}>Message if Correct</Form.Label>
                                        <Form.Control
                                            type='text'
                                            maxLength='512'
                                            id={`msgIfCorrect-${idx}`}
                                            name={`msgIfCorrect-${idx}`}
                                            value={this.props.question.msgIfCorrect}
                                            onChange={this.handleChange}
                                            readOnly={this.props.handleQuizChange && !this.props.editable}
                                        />
                                    </Col>
                                    <Col md={6}>
                                        <Form.Label htmlFor={`msgIfWrong-${idx}`}>Message if Wrong</Form.Label>
                                        <Form.Control
                                            type='text'
                                            maxLength='512'
                                            id={`msgIfWrong-${idx}`}
                                            name={`msgIfWrong-${idx}`}
                                            value={this.props.question.msgIfWrong}
                                            onChange={this.handleChange}
                                            readOnly={this.props.handleQuizChange && !this.props.editable}
                                        />
                                    </Col>
                                </Row>
                                <Row className='pt-3'>
                                    <Col md={4}>
                                        <Form.Label htmlFor={`marksIfCorrect-${idx}`}>Marks if Correct</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id={`marksIfCorrect-${idx}`}
                                            name={`marksIfCorrect-${idx}`}
                                            value={this.props.question.marksIfCorrect ?? 1}
                                            onChange={this.handleChange}
                                            readOnly={this.props.handleQuizChange && !this.props.editable}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label htmlFor={`marksIfWrong-${idx}`}>Marks if Wrong</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id={`marksIfWrong-${idx}`}
                                            name={`marksIfWrong-${idx}`}
                                            value={this.props.question.marksIfWrong || ''}
                                            onChange={this.handleChange}
                                            readOnly={this.props.handleQuizChange && !this.props.editable}
                                        />
                                    </Col>
                                    <Col md={4}>
                                        <Form.Label htmlFor={`marksIfSkipped-${idx}`}>Marks if Skipped</Form.Label>
                                        <Form.Control
                                            type='number'
                                            id={`marksIfSkipped-${idx}`}
                                            name={`marksIfSkipped-${idx}`}
                                            value={this.props.question.marksIfSkipped || ''}
                                            onChange={this.handleChange}
                                            readOnly={this.props.handleQuizChange && !this.props.editable}
                                        />
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
            </div>
        );
    }
}
