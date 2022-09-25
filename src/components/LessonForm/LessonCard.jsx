import React, { Component } from 'react';
import Select from 'react-select';
import { Row, Col, Accordion, Card, Button, FormGroup, Form, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrash, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import './LessonCard.scss';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { AsyncPreviewFileUpload } from '../../components/FileUpload';
import ExamForm from '../../pages/Admin/Courses/ExamForm';
import Editor from '../../components/Editor';

export default class LessonCard extends Component {
    _isMounted = false;

    state = {
        modalShow: false,
        showQuizModal: false,
    };

    cardTypes = ['TEXT', 'HEADING', 'AUDIO', 'AUDIO_BIG', 'VIDEO', 'IMAGE', 'SINGLE_QUESTION', 'DOCUMENT', 'QUIZ'];

    constructor(props) {
        super(props);

        this.cardTypeOpts = this.cardTypes.map((type) => {
            const label = (type.charAt(0).toUpperCase() + type.substr(1).toLowerCase()).replaceAll('_', ' ');
            return { label, value: type };
        });
    }

    handleVideoIdPaste = async (event) => {
        const id =
            /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/gi.exec(
                (event.clipboardData || window.clipboardData).getData('text')
            );

        if (id && id[1]) {
            event.preventDefault();
            event.stopPropagation();

            this.props.handleCardChange(this.props.card, event.target.name, id[1]);
        }
    };

    componentWillUnmount = async () => {
        this._isMounted = false;
    };

    componentDidMount = async () => {
        this._isMounted = true;
    };

    handleFileChange = (type, url, file) => {
        this.props.handleFileChange(this.props.card, type, url, file);
    };

    quizModalHandleClose = (endOfChapterQuizId = undefined) =>
        this.setState({ showQuizModal: false, endOfChapterQuizId });
    quizModalHandleShow = () => this.setState({ showQuizModal: true });

    handleQuizChange = (quiz) => {
        this.props.handleCardChange(this.props.card, 'quiz', quiz);
    };

    render() {
        const { card } = this.props;

        return (
            <div className='admin-lesson-card-form'>
                <ConfirmationModal
                    show={this.state.modalShow}
                    hideModal={() => {
                        this.setState({ modalShow: false });
                    }}
                    confirmAction={() => {
                        this.props.deleteItem(this.props.idx);
                        this.setState({
                            modalShow: false,
                        });
                    }}
                    titleText={'Are you sure?'}
                    bodyText={['You are about to ', <strong key='modal-type'>delete</strong>, ' this Card.']}
                />
                {this.props.editable && card.orderIndex === 0 ? (
                    <Button
                        className='btn-plus my-1'
                        size='sm'
                        block
                        onClick={(e) => {
                            this.props.addNewCard(0);
                        }}>
                        +
                    </Button>
                ) : (
                    <></>
                )}
                <Accordion>
                    <Card>
                        <Accordion.Toggle as={Card.Header} eventKey='0'>
                            <Row>
                                <Col xs={12} md={4} className='my-2 my-lg-0'>
                                    {this.props.editable ? (
                                        <span
                                            {...this.props.dragHandleProps}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                            }}>
                                            <FontAwesomeIcon icon={faEllipsisV} style={{ marginRight: '20px' }} />
                                        </span>
                                    ) : (
                                        <></>
                                    )}
                                    <Form.Control
                                        type='number'
                                        placeholder='Index'
                                        min='1'
                                        max={this.props.numOfCards}
                                        id='orderIndex'
                                        name='orderIndex'
                                        className='d-inline-block'
                                        style={{
                                            width: '20%',
                                            marginRight: '20px',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        value={card.orderIndex + 1}
                                        onChange={(event) => {
                                            this.props.manualIdxChange(event.target.value - 1, card.orderIndex);
                                        }}
                                        readOnly={!this.props.editable || card.submissionInProgress}
                                    />
                                    <Form.Control
                                        type='text'
                                        placeholder='Card title...'
                                        minLength='3'
                                        maxLength='512'
                                        id='cardTitle'
                                        name='cardTitle'
                                        className='d-inline-block'
                                        style={{
                                            width: '50%',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        value={card.cardTitle}
                                        onChange={(event) => {
                                            this.props.handleCardChange(card, event.target.name, event.target.value);
                                        }}
                                        readOnly={!this.props.editable || card.submissionInProgress}
                                    />
                                </Col>
                                <Col
                                    xs={12}
                                    md={5}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}>
                                    <Select
                                        name='cardType'
                                        placeholder='Card type...'
                                        menuPortalTarget={document.body}
                                        menuPosition={'fixed'}
                                        value={
                                            this.cardTypeOpts.filter((opt) => {
                                                return card.cardType === opt.value;
                                            })[0]
                                        }
                                        defaultValue={this.cardTypeOpts[0]}
                                        options={this.cardTypeOpts}
                                        styles={{
                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                        }}
                                        closeMenuOnScroll={event => {
                                            return event.target.id === 'mainContainerId';
                                        }}
                                        onChange={(event) => {
                                            this.props.handleCardChange(card, 'cardType', event.value);
                                        }}
                                        isDisabled={!this.props.editable || card.submissionInProgress}></Select>
                                </Col>
                                {this.props.editable ? (
                                    <Col xs={12} md={3} className='my-2 my-md-0'>
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
                                                disabled={card.submissionInProgress}>
                                                <FontAwesomeIcon icon={faTrash} />
                                            </Button>
                                        </OverlayTrigger>
                                        <OverlayTrigger placement='top' overlay={<Tooltip>Edit</Tooltip>}>
                                            <Accordion.Toggle
                                                as={Button}
                                                variant='link'
                                                className='float-right mx-1'
                                                eventKey='0'>
                                                <FontAwesomeIcon icon={faPencilAlt} />
                                            </Accordion.Toggle>
                                        </OverlayTrigger>
                                    </Col>
                                ) : (
                                    <></>
                                )}
                            </Row>
                        </Accordion.Toggle>
                        <Accordion.Collapse eventKey='0'>
                            <Card.Body>
                                <Row>
                                    {card.cardType === 'SINGLE_QUESTION' ? (
                                        <Col>
                                            <FormGroup>
                                                <Form.Label htmlFor='question'>Question</Form.Label>
                                                <Form.Control
                                                    id='question'
                                                    name='question'
                                                    type='text'
                                                    minLength='3'
                                                    maxLength='512'
                                                    value={
                                                        Array.isArray(card?.questions) && card?.questions[0]
                                                            ? card?.questions[0]?.question
                                                            : ''
                                                    }
                                                    onChange={(event) => {
                                                        this.props.handleCardChange(
                                                            card,
                                                            event.target.name,
                                                            event.target.value
                                                        );
                                                    }}
                                                    readOnly={!this.props.editable || card.submissionInProgress}
                                                />
                                            </FormGroup>
                                            <Form.Group>
                                                <Form.Label>Answers</Form.Label>
                                                <Col>
                                                    {[0, 1, 2, 3].map((i) => {
                                                        return (
                                                            <Form.Label className='d-block' key={i}>
                                                                <Form.Check
                                                                    type='checkbox'
                                                                    name={`answersCorrect-${card.uuid}`}
                                                                    className='d-inline-block'
                                                                    checked={
                                                                        Array.isArray(card?.questions) &&
                                                                        card.questions[0] &&
                                                                        card.questions[0].correctAnswers &&
                                                                        card.questions[0].correctAnswers.contains(i)
                                                                    }
                                                                    onChange={(event) => {
                                                                        const answers = card.questions[0].answers.map(
                                                                                (answer, j) => {
                                                                                    answer.correct = j === i;
                                                                                    return answer;
                                                                                }
                                                                            ),
                                                                            questions = Array.isArray(card.questions)
                                                                                ? card.questions
                                                                                : [];

                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            'questions',
                                                                            questions
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        !this.props.editable ||
                                                                        card.submissionInProgress
                                                                    }
                                                                />
                                                                <Form.Control
                                                                    className='d-inline-block ml-3'
                                                                    style={{
                                                                        width: '80%',
                                                                    }}
                                                                    value={card.answers && card.answers[i].value}
                                                                    onChange={(event) => {
                                                                        const answers = card.answers.map(
                                                                            (answer, j) => {
                                                                                if (i === j) {
                                                                                    answer.value = event.target.value;
                                                                                }
                                                                                return answer;
                                                                            }
                                                                        );

                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            'answers',
                                                                            answers
                                                                        );
                                                                    }}
                                                                />
                                                            </Form.Label>
                                                        );
                                                    })}
                                                </Col>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Check
                                                    className='ml-3 mt-3'
                                                    id='requiresCorrectAnswer'
                                                    name='requiresCorrectAnswer'
                                                    type='checkbox'
                                                    label='&nbsp;Require Correct Answer To Proceed'
                                                    checked={card.requiresCorrectAnswer}
                                                    onChange={(event) => {
                                                        this.props.handleCardChange(
                                                            card,
                                                            event.target.name,
                                                            event.target.checked
                                                        );
                                                    }}
                                                    disabled={!this.props.editable || card.submissionInProgress}
                                                />
                                            </Form.Group>
                                        </Col>
                                    ) : card.cardType === 'QUIZ' ? (
                                        <Col>
                                            <Button onClick={this.quizModalHandleShow}>
                                                {card.quiz && !this.props.editable ? 'View' : 'Edit'}
                                            </Button>
                                        </Col>
                                    ) : (
                                        <Col>
                                            <FormGroup>
                                                <Form.Label htmlFor='heading'>Heading</Form.Label>
                                                <Form.Control
                                                    id='heading'
                                                    name='heading'
                                                    type='text'
                                                    minLength='3'
                                                    maxLength='512'
                                                    value={card.heading}
                                                    onChange={(event) => {
                                                        this.props.handleCardChange(
                                                            card,
                                                            event.target.name,
                                                            event.target.value
                                                        );
                                                    }}
                                                    readOnly={!this.props.editable || card.submissionInProgress}
                                                />
                                            </FormGroup>

                                            {(card.cardType === 'HEADING' ||
                                                card.cardType === 'TEXT' ||
                                                card.cardType === 'IMAGE' ||
                                                card.cardType === 'DOCUMENT') && (
                                                <FormGroup>
                                                    <Form.Label htmlFor='text'>Text</Form.Label>
                                                    <Editor
                                                        defaultValue={card.content}
                                                        onChange={(e) => {
                                                            this.props.handleCardChange(
                                                                card,
                                                                'content',
                                                                e.target.value
                                                            );
                                                        }}
                                                        disabled={!this.props.editable || card.submissionInProgress}
                                                    />
                                                </FormGroup>
                                            )}

                                            {(card.cardType === 'VIDEO' ||
                                                card.cardType === 'AUDIO' ||
                                                card.cardType === 'AUDIO_BIG') && (
                                                <FormGroup>
                                                    <Form.Label htmlFor='subHeading'>Sub Heading</Form.Label>
                                                    <Form.Control
                                                        id='subHeading'
                                                        name='subHeading'
                                                        type='text'
                                                        minLength='3'
                                                        maxLength='512'
                                                        value={card.subHeading}
                                                        onChange={(event) => {
                                                            this.props.handleCardChange(
                                                                card,
                                                                event.target.name,
                                                                event.target.value
                                                            );
                                                        }}
                                                        readOnly={!this.props.editable || card.submissionInProgress}
                                                    />
                                                </FormGroup>
                                            )}

                                            {card.cardType === 'HEADING' && (
                                                <>
                                                    <FormGroup>
                                                        <Accordion>
                                                            <Form.Label htmlFor='bgColor'>
                                                                <Accordion.Toggle
                                                                    as={Button}
                                                                    variant='link'
                                                                    eventKey='0'>
                                                                    <strong>Background Color</strong>
                                                                </Accordion.Toggle>
                                                            </Form.Label>
                                                            <Accordion.Collapse eventKey='0'>
                                                                <Form.Control
                                                                    type='color'
                                                                    id='bgColor'
                                                                    name='bgColor'
                                                                    value={card.bgColor}
                                                                    onChange={(event) => {
                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            event.target.name,
                                                                            event.target.value
                                                                        );
                                                                    }}
                                                                    readOnly={
                                                                        !this.props.editable ||
                                                                        card.submissionInProgress
                                                                    }
                                                                />
                                                            </Accordion.Collapse>
                                                        </Accordion>
                                                    </FormGroup>

                                                    <FormGroup>
                                                        <Accordion>
                                                            <Form.Label htmlFor='fgColor'>
                                                                <Accordion.Toggle
                                                                    as={Button}
                                                                    variant='link'
                                                                    eventKey='0'>
                                                                    <strong>Font Color</strong>
                                                                </Accordion.Toggle>
                                                            </Form.Label>
                                                            <Accordion.Collapse eventKey='0'>
                                                                <Form.Control
                                                                    type='color'
                                                                    id='fgColor'
                                                                    name='fgColor'
                                                                    value={card.fgColor}
                                                                    onChange={(event) => {
                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            event.target.name,
                                                                            event.target.value
                                                                        );
                                                                    }}
                                                                    readOnly={
                                                                        !this.props.editable ||
                                                                        card.submissionInProgress
                                                                    }
                                                                />
                                                            </Accordion.Collapse>
                                                        </Accordion>
                                                    </FormGroup>
                                                </>
                                            )}

                                            {card.cardType === 'IMAGE' && (
                                                <>
                                                    <Row>
                                                        <Col>
                                                            <FormGroup>
                                                                <AsyncPreviewFileUpload
                                                                    id='sourceImage'
                                                                    name='sourceImage'
                                                                    file={card.sourceImage}
                                                                    handleFileChange={this.handleFileChange}
                                                                    type='image'
                                                                    disabled={
                                                                        !this.props.editable ||
                                                                        card.submissionInProgress
                                                                    }
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col className='pt-2'>
                                                            <Form.Group>
                                                                <Form.Check
                                                                    id='imageImportance'
                                                                    name='imageImportance'
                                                                    type='checkbox'
                                                                    label='&nbsp;Mark Image as
                                                        Important'
                                                                    checked={card.imageImportance}
                                                                    onChange={(event) => {
                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            event.target.name,
                                                                            event.target.checked
                                                                        );
                                                                    }}
                                                                    disabled={
                                                                        !this.props.editable ||
                                                                        card.submissionInProgress
                                                                    }
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col>
                                                            <FormGroup>
                                                                <label htmlFor='imagePosition'>Image position</label>
                                                                <select
                                                                    name='imagePosition'
                                                                    onChange={(event) => {
                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            event.target.name,
                                                                            event.target.value
                                                                        );
                                                                    }}
                                                                    defaultValue={card?.imagePosition ?? 'TOP'}>
                                                                    <option value='TOP'>Top</option>
                                                                    <option value='LEFT'>Left</option>
                                                                    <option value='RIGHT'>Right</option>
                                                                    <option value='BG'>Background</option>
                                                                </select>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col>
                                                            <FormGroup>
                                                                <Form.Label htmlFor='imageUrl'>Link URL</Form.Label>
                                                                <Form.Control
                                                                    id='imageUrl'
                                                                    name='imageUrl'
                                                                    type='url'
                                                                    value={card.imageUrl}
                                                                    onChange={(event) => {
                                                                        this.props.handleCardChange(
                                                                            card,
                                                                            event.target.name,
                                                                            event.target.value
                                                                        );
                                                                    }}
                                                                    readOnly={
                                                                        !this.props.editable ||
                                                                        card.submissionInProgress
                                                                    }
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                </>
                                            )}

                                            {(card.cardType === 'AUDIO' || card.cardType === 'AUDIO_BIG') && (
                                                <FormGroup>
                                                    <AsyncPreviewFileUpload
                                                        id='sourceAudio'
                                                        name='sourceAudio'
                                                        file={card.sourceAudio}
                                                        handleFileChange={this.handleFileChange}
                                                        type='audio'
                                                        disabled={!this.props.editable || card.submissionInProgress}
                                                    />
                                                </FormGroup>
                                            )}

                                            {card.cardType === 'VIDEO' && (
                                                <FormGroup>
                                                    <Form.Label htmlFor='heading'>Video ID</Form.Label>
                                                    <Form.Control
                                                        id='sourceVideo'
                                                        name='sourceVideo'
                                                        placeholder='123456789'
                                                        type='url'
                                                        value={card.sourceVideo}
                                                        onChange={(event) => {
                                                            this.props.handleCardChange(
                                                                card,
                                                                event.target.name,
                                                                event.target.value
                                                            );
                                                        }}
                                                        onPaste={this.handleVideoIdPaste}
                                                        readOnly={!this.props.editable || card.submissionInProgress}
                                                    />
                                                </FormGroup>
                                            )}

                                            {card.cardType !== 'TEXT' &&
                                                card.cardType !== 'HEADING' &&
                                                card.cardType !== 'DOCUMENT' &&
                                                card.cardType !== 'IMAGE' && (
                                                    <FormGroup>
                                                        <Form.Label htmlFor='transcript'>Transcript</Form.Label>
                                                        <Editor
                                                            defaultValue={card.transcript}
                                                            onChange={(e) => {
                                                                this.props.handleCardChange(
                                                                    card,
                                                                    'transcript',
                                                                    e.target.value
                                                                );
                                                            }}
                                                            disabled={!this.props.editable || card.submissionInProgress}
                                                        />
                                                    </FormGroup>
                                                )}

                                            {card.cardType === 'DOCUMENT' && (
                                                <FormGroup>
                                                    <AsyncPreviewFileUpload
                                                        id='sourceDocument'
                                                        name='sourceDocument'
                                                        file={card.sourceDocument}
                                                        handleFileChange={this.handleFileChange}
                                                        type='document'
                                                        disabled={!this.props.editable || card.submissionInProgress}
                                                    />
                                                </FormGroup>
                                            )}

                                            <FormGroup>
                                                <Accordion>
                                                    <Form.Label htmlFor='info'>
                                                        <Accordion.Toggle as={Button} variant='link' eventKey='0'>
                                                            <strong>Information</strong>
                                                        </Accordion.Toggle>
                                                    </Form.Label>
                                                    <Accordion.Collapse eventKey='0'>
                                                        <Editor
                                                            defaultValue={card.info}
                                                            onChange={(e) => {
                                                                this.props.handleCardChange(
                                                                    card,
                                                                    'info',
                                                                    e.target.value
                                                                );
                                                            }}
                                                            disabled={!this.props.editable || card.submissionInProgress}
                                                        />
                                                    </Accordion.Collapse>
                                                </Accordion>
                                            </FormGroup>
                                        </Col>
                                    )}
                                </Row>
                            </Card.Body>
                        </Accordion.Collapse>
                    </Card>
                </Accordion>
                {this.props.editable ? (
                    <Button
                        className='btn-plus my-1'
                        size='sm'
                        block
                        onClick={(e) => {
                            this.props.addNewCard(card.orderIndex + 1);
                        }}>
                        +
                    </Button>
                ) : (
                    <></>
                )}
            </div>
        );
    }
}
