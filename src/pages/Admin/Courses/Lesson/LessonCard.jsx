import React, { Component } from 'react';
import { Accordion, AccordionContext, Card } from 'react-bootstrap';
import { BsPencilSquare, BsPlus, BsThreeDotsVertical, BsTrashFill } from 'react-icons/bs';
import { FiCopy } from 'react-icons/fi';
import { Draggable } from 'react-beautiful-dnd';
import LessonCardForm from './LessonCardForm';
import AdminLessonContext from './AdminLessonContext';

export default class LessonCard extends Component {
    static contextType = AdminLessonContext;

    state = {
        _id: this.props._id,
        cardType: this.props.cardType ?? 'TEXT',
        cardTitle: this.props.cardTitle ?? 'Card reference',
    };

    cardTypes = {
        TRANSITION: 'Transition',
        TEXT: 'Text',
        HEADING: 'Heading',
        AUDIO: 'Audio',
        /* AUDIO_BIG: 'Audio big', */
        VIDEO: 'Video',
        IMAGE: 'Image',
        SINGLE_QUESTION: 'Question',
        HOTSPOT_LIST: 'Hotspot list',
        HOTSPOT_MAP: 'Hotspot map',
        HORIZONTAL_LIST: 'Horizontal list',
        MNEMONIC: 'Mnemonic',
        DOCUMENT: 'Document',
        QUIZ: 'Quiz',
    };

    accordionToggleRef = React.createRef();

    stopPropagation = (e) => {
        if (e && typeof e?.stopPropagation === 'function') {
            e.stopPropagation();
        }
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.context.handleQuizCards(this.props.orderIndex, {
            [input.name]: input.value,
        });

        this.setState(
            {
                [input.name]: input.value,
            },
            () => {
                this.context.patchLessonCard(
                    this.props.orderIndex,
                    {
                        [input.name]: input.value,
                    },
                    this.context.enableSaveButton
                );
            }
        );
    };

    handleDragHandleClick = (e, activeElement) => {
        if (activeElement === '0' && this.accordionToggleRef.current) {
            this.accordionToggleRef.current.click();
        } else {
            this.stopPropagation(e);
        }
    };

    render() {
        const {
            props: { lastCardIndex, insertNewCard, removeCard, handleIndexChange, orderIndex, cloneCard },
            state: { cardTitle, cardType, _id },
            context: {
                lesson: { draft },
            },
        } = this;

        return (
            <Draggable draggableId={_id} index={orderIndex}>
                {(provided, snapshot) => (
                    <div className='lesson-cards__item'>
                        <span
                            className='bd'
                            onClick={() => {
                                insertNewCard();
                            }}
                            data-orderindex={orderIndex}
                        >
                            <BsPlus />
                        </span>
                        <Accordion ref={provided.innerRef} {...provided.draggableProps}>
                            <AccordionContext.Consumer>
                                {(value) => (
                                    <Card>
                                        <Accordion.Toggle as={Card.Header} ref={this.accordionToggleRef} eventKey='0'>
                                            <span
                                                {...provided.dragHandleProps}
                                                onMouseDown={(e) => {
                                                    this.handleDragHandleClick(e, value);
                                                }}
                                                onClick={this.stopPropagation}
                                            >
                                                <BsThreeDotsVertical />
                                            </span>
                                            <input
                                                type='number'
                                                name='orderIndex'
                                                id='orderIndex'
                                                value={orderIndex + 1}
                                                onChange={handleIndexChange}
                                                onClick={this.stopPropagation}
                                            />
                                            <input
                                                type='text'
                                                name='cardTitle'
                                                id={`cardTitle-${orderIndex}`}
                                                value={cardTitle}
                                                onChange={this.handleInputChange}
                                                onClick={this.stopPropagation}
                                            />
                                            <div className='cardType-select'>
                                                <select
                                                    name='cardType'
                                                    id='cardType'
                                                    value={cardType}
                                                    onChange={this.handleInputChange}
                                                    onClick={this.stopPropagation}
                                                >
                                                    {Object.keys(this.cardTypes).map((key) => (
                                                        <option key={key} value={key}>
                                                            {this.cardTypes[key]}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <button className='bd'>
                                                    <BsPencilSquare />
                                                </button>
                                                <button
                                                    className='bd'
                                                    onClick={(e) => {
                                                        this.stopPropagation(e);
                                                        cloneCard();
                                                    }}
                                                >
                                                    <FiCopy />
                                                </button>
                                                <button
                                                    className='bd'
                                                    onClick={(e) => {
                                                        this.stopPropagation(e);
                                                        removeCard();
                                                    }}
                                                    data-orderindex={orderIndex}
                                                >
                                                    <BsTrashFill />
                                                </button>
                                            </div>
                                        </Accordion.Toggle>
                                        <Accordion.Collapse eventKey='0'>
                                            <Card.Body className='lesson-cards__item__form'>
                                                <LessonCardForm
                                                    {...this.props}
                                                    cardType={cardType}
                                                    cardTitle={cardTitle}
                                                />
                                            </Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                )}
                            </AccordionContext.Consumer>
                        </Accordion>
                        {orderIndex === lastCardIndex && (
                            <span
                                className='bd'
                                onClick={() => {
                                    insertNewCard(lastCardIndex + 1);
                                }}
                            >
                                <BsPlus />
                            </span>
                        )}
                    </div>
                )}
            </Draggable>
        );
    }
}
