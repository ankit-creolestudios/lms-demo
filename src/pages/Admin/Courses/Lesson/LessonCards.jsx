import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Spinner } from '../../../../components/Spinner';
import LessonCard from './LessonCard';
import { withRouter } from 'react-router-dom';
import apiCall from '../../../../helpers/apiCall';
import rfdc from 'rfdc';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import uuid from 'react-uuid';
import AdminLessonContext from './AdminLessonContext';

const cloneObject = rfdc({ proto: true });

class LessonCards extends Component {
    static contextType = AdminLessonContext;

    counterS = 0;

    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            pageStatus: 'LOADING',
            cardsSubmitted: 0,
            currentLessonId: props?.match?.params?.lessonId ?? '',
        };
    }

    async componentDidMount() {
        this._isMounted = true;

        this.loadLessonCards(this.context?.lesson?._id);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLessonId !== (this.context?.lesson?._id ?? '')) {
            this.setState(
                {
                    pageStatus: 'LOADING',
                    currentLessonId: this.context?.lesson?._id ?? '',
                },
                () => {
                    this.loadLessonCards(this.context?.lesson?._id);
                }
            );
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    reorderCards = (startIndex, endIndex) => {
        const cards = [...this.context.cards],
            [removed] = cards.splice(startIndex, 1);

        cards.splice(endIndex, 0, removed);

        this.context.updateCards(
            cards.map((card, index) => ({
                ...card,
                orderIndex: index,
            })),
            this.context.enableSaveButton
        );
    };

    handleDragAndDropEnd = (result) => {
        this.reorderCards(result.source.index, result.destination.index);
    };

    loadLessonCards = async (lessonId) => {
        const { success, response, message } = await apiCall(
            'GET',
            `/${this.props.match.params.coreId ? 'core' : 'courses'}/lessons/${lessonId}/cards`
        );

        if (this._isMounted) {
            if (success) {
                this.setState(
                    {
                        pageStatus: 'READY',
                        currentLessonId: lessonId,
                    },
                    () => {
                        this.context.updateCards(
                            response?.length > 0
                                ? response
                                      .map((card) => {
                                          const { draft, ...rest } = card;

                                          return { ...rest, ...draft };
                                      })
                                      .sort((a, b) => a.orderIndex - b.orderIndex)
                                : [
                                      {
                                          _id: uuid(),
                                          cardType: 'TEXT',
                                          cardTitle: 'Card reference',
                                          orderIndex: 0,
                                      },
                                  ]
                        );
                        this.context.handleAddAllQuizCards(
                            response ? response.filter((card) => card.draft.cardType === 'QUIZ') : []
                        );
                    }
                );
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? 'Failed to load lesson cards',
                });
            }
        }
    };

    cloneCard = (orderIndex) => {
        this.insertNewCard(
            orderIndex + 1,
            Object.assign({}, cloneObject(this.context.cards[orderIndex]), {
                _id: uuid(),
                cardTitle: `${this.context.cards[orderIndex].cardTitle} copy`,
            })
        );
    };

    insertNewCard = (orderIndex, content) => {
        const cards = [...this.context.cards];

        cards.splice(
            orderIndex,
            0,
            content ?? {
                _id: uuid(),
                cardType: 'TEXT',
                cardTitle: 'Card reference',
                orderIndex,
            }
        );

        this.context.updateCards(cards, this.context.enableSaveButton);
    };

    removeCard = (orderIndex) => {
        const cards = [...this.context.cards],
            deletedCards = [...this.context.deletedCards];
        const [deletedCard] = cards.splice(orderIndex, 1);

        if (cards.length === 0) {
            cards.splice(0, 0, {
                _id: uuid(),
                cardType: 'TEXT',
                cardTitle: 'Card reference',
                orderIndex,
            });
        }

        if (!deletedCard._id.includes('-')) {
            const { _id, cardTitle, orderIndex } = deletedCard;

            deletedCards.push({ _id, cardTitle, orderIndex });
        }

        this.context.updateCards(cards, this.context.enableSaveButton);
        this.context.updateDeletedCards(deletedCards);
    };

    handleIndexChange = (e, startIndex) => {
        const input = e.target,
            endIndex = parseInt(input.value);

        this.reorderCards(startIndex, endIndex);
    };

    render() {
        const {
            state: { pageStatus },
            context: { cards },
        } = this;

        if (pageStatus === 'READY') {
            return (
                <DragDropContext onDragEnd={this.handleDragAndDropEnd}>
                    <Droppable droppableId='lessonCards'>
                        {(provided, snapshot) => (
                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                {cards.map((card, index) => (
                                    <LessonCard
                                        _id={card._id}
                                        {...card}
                                        key={card._id}
                                        lastCardIndex={cards.length - 1}
                                        insertNewCard={(indexCard) => {
                                            this.insertNewCard(indexCard ?? index);
                                        }}
                                        cloneCard={() => {
                                            this.cloneCard(index);
                                        }}
                                        removeCard={() => {
                                            this.removeCard(index);
                                        }}
                                        orderIndex={index}
                                        handleIndexChange={(e) => {
                                            this.handleIndexChange(e, index);
                                        }}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            );
        }
        return <Spinner />;
    }
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(LessonCards));
