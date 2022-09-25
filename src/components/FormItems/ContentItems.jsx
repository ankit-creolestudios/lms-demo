import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { FormGroup } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import apiCall from '../../helpers/apiCall';
import { ConfirmationModal } from '../ConfirmationModal';
import { ItemCard } from '.';
import AddOrSearchBar from './AddOrSearchBar';
import qs from 'qs';
import { Spinner } from '../Spinner';

class ContentItems extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        const typeTitle = props.type[0].toUpperCase() + props.type.substr(1).toLowerCase();

        this.state = {
            params: qs.parse(this.props.location.search, {
                ignoreQueryPrefix: true,
            }),
            loading: false,
            items: props.items ? null : [],
            itemsToDelete: [],
            typeTitle,
            modalShow: false,
            modalAction: null,
            modalType: '',
            coreKey: 'core' + typeTitle + 'sLink',
            refreshLinkedOptions: false,
            selectedLessons: props.selectedLessons,
        };
    }

    loadThings = async () => {
        if (['chapter', 'lesson'].indexOf(this.props.type) >= 0) {
            this.setState({
                loading: true,
            });

            let url = '';
            if (this.props.type === 'chapter' && this.props.source !== 'core') {
                url = `/courses/chapters/course/${this.props.parentDocId}`;
            } else if (this.props.type === 'chapter') {
                url = `/core/chapters/core/${this.props.parentDocId}`;
            } else if (this.props.type === 'lesson' && this.props.source !== 'core') {
                if (this.props.parentsCoreLink) {
                    url = `/core/chapters/${this.props.parentsCoreLink}/lessons`;
                } else {
                    url = `/courses/lessons/chapter/${this.props.parentDocId}`;
                }
            } else if (this.props.type === 'lesson') {
                url = `/core/chapters/${this.props.parentDocId}/lessons`;
            }

            const { success, response } = await apiCall('GET', url);

            if (this._isMounted) {
                this.setState({
                    loading: false,
                });

                if (success && response && response[this.props.type + 's'] && response[this.props.type + 's'].length) {
                    const items = response[this.props.type + 's'].map((item) => {
                        return {
                            ...item,
                            draggableId: item._id,
                            ref: React.createRef(),
                        };
                    });

                    this.setState({
                        items,
                    });

                    if (this.props.type === 'lesson') {
                        this.recalculateTimes(items);
                    }

                    if (!this.props.parentsCoreLink) {
                        this.props.updateRegister(items, 'add', this.props.parentDocId);
                    }

                    [this.state.params.focus, this.state.params.highlight].forEach((_id) => {
                        if (_id) {
                            let matchedItem = this.state.items.filter((item) => {
                                return item._id === _id;
                            });

                            if (matchedItem.length) {
                                matchedItem = matchedItem[0];
                            }

                            if (matchedItem.ref && matchedItem.ref.current) {
                                matchedItem.ref.current.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                });
                                matchedItem.ref.current.classList.toggle('cardHighlight');
                                setTimeout(() => {
                                    if (matchedItem.ref.current) {
                                        matchedItem.ref.current.classList.toggle('cardHighlight');
                                    }
                                }, 5000);
                            }
                        }
                    });
                }
            }
        }
    };
    componentDidMount = () => {
        this._isMounted = true;
        this.loadThings();
    };

    componentWillUnmount = () => {
        this._isMounted = false;
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.doSubmit && this.props.doSubmit && this._isMounted) {
            this.submit();
        }
        if (prevProps.selectedLessons !== this.props.selectedLessons) {
            this.setState({ selectedLessons: this.props.selectedLessons });
        }
    }

    unsetRefreshLinkedOptions = () => {
        this.setState({
            refreshLinkedOptions: false,
        });
    };

    addNewItem = (item) => {
        if (this.props.setItems) {
            this.props.setItems(this.props.type, [...this.props.items, item]);
        } else {
            this.setState({
                items: [...this.state.items, item],
            });
            this.props.updateRegister(item, 'add', this.props.parentDocId);
        }
        this.setState({
            refreshLinkedOptions: true,
        });
        if (this.props.setIsDirty) {
            this.props.setIsDirty(true);
        }
    };

    deleteItem = (item) => {
        this.setState({
            modalShow: true,
            modalAction: () => {
                const newItems = (this.props.items || this.state.items).filter((thisItem) => {
                    if (this.props.type === 'package') {
                        return item !== thisItem;
                    } else {
                        return item.draggableId !== thisItem.draggableId;
                    }
                });

                if (!this.props.setItems) {
                    let newItemsToDelete = [...this.state.itemsToDelete];
                    if (!item.isNew) {
                        newItemsToDelete.push(item);
                        this.props.updateRegister(item, 'delete_children');
                    } else {
                        this.props.updateRegister(item, 'delete');
                    }

                    this.setState({
                        modalShow: false,
                        itemsToDelete: newItemsToDelete,
                        items: newItems,
                    });
                } else {
                    this.props.setItems(this.props.type, newItems);
                    this.setState({
                        modalShow: false,
                    });
                }
                this.setState({
                    refreshLinkedOptions: true,
                });
                if (this.props.setIsDirty) {
                    this.props.setIsDirty(true);
                }
            },
            modalType: this.state.typeTitle === 'Package' || this.state.typeTitle === 'Course' ? 'remove' : 'delete',
        });
    };

    updateItem = (item) => {
        let items = [...(this.props.items ? this.props.items : this.state.items)];
        this.props.setItems(
            this.props.type,
            items.map((thisItem) => {
                if (thisItem.draggableId === item.draggableId) {
                    return item;
                } else {
                    return thisItem;
                }
            })
        );
    };

    unlinkItem = (item) => {
        this.setState({
            modalShow: true,
            modalAction: () => {
                this.setState({
                    items: this.state.items.map((thisItem) => {
                        if (item._id === thisItem._id) {
                            thisItem['core' + this.state.typeTitle + 'sLink'] = null;
                        }
                        return thisItem;
                    }),
                    modalShow: false,
                    refreshLinkedOptions: true,
                });
                if (this.props.setIsDirty) {
                    this.props.setIsDirty(true);
                }
            },
            modalType: 'unlink',
        });
    };

    cloneItem = async (item) => {
        this.setState({
            modalShow: true,
            modalAction: async () => {
                const { success, message } = await apiCall(
                    'POST',
                    `/${this.props.source}/${this.props.type}s/${item._id}/clone`
                );

                if (success) {
                    this.loadThings();
                    this.props.setGlobalAlert({
                        type: 'success',
                        message: message ?? `${this.state.typeTitle} has been cloned succesfully!`,
                    });
                } else {
                    this.props.setGlobalAlert({
                        type: 'error',
                        message:
                            message ??
                            `There was an unexpected problem with cloning this ${this.state.typeTitle}. Please try again.`,
                    });
                }
                this.setState({
                    modalShow: false,
                });
            },
            modalType: 'clone',
        });
    };

    submit = async () => {
        if (this.state.itemsToDelete.length > 0) {
            const idsToDelete = this.state.itemsToDelete.map((item) => item._id).join(',');

            const { success } = await apiCall('DELETE', `/${this.props.source}/${this.props.type}s/${idsToDelete}`);

            if (this._isMounted && success) {
                this.props.updateRegister(this.state.itemsToDelete, 'submitted');
            } else {
                this.props.updateRegister(this.state.itemsToDelete, 'error');
            }
        }
    };

    handleDragAndDrop = (result) => {
        if (!result.destination || result.destination.index === result.source.index) return;

        let items = [...(this.props.items ? this.props.items : this.state.items)];

        let itemZero = items.length > 0 ? items[0] : null;
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        if (this.props.type !== 'package' && this.props.source !== 'core') {
            if (itemZero) {
                itemZero.conditionStatement = 'ANY_TIME';
            }
            items[0].conditionStatement = 'ANY_TIME';
        }

        if (this.props.setItems) {
            this.props.setItems(this.props.type, items);
        } else {
            this.setState({
                items,
            });
        }
        if (this.props.setIsDirty) {
            this.props.setIsDirty(true);
        }
    };

    totalTime = (items, prop) => {
        return items.reduce((accumulator, item) => {
            item = item.isNew ? item : item.draft;
            return accumulator + parseInt(item && item[prop] ? item[prop] : 0);
        }, 0);
    };

    recalculateTimes = (items) => {
        const totalMaxTime = this.totalTime(items, 'maxTime');
        const totalRequiredTime = this.totalTime(items, 'requiredTime');
        this.props.updateTime(totalMaxTime, totalRequiredTime);
    };

    updateStateItem = (item) => {
        const newItems = this.state.items.map((thisItem) => {
            return thisItem.draggableId === item.draggableId ? item : thisItem;
        });
        this.setState({
            items: newItems,
        });

        if (this.props.updateTime) {
            this.recalculateTimes(newItems);
        }
    };

    handleSelectLesson = (lessonID) => {
        // this.props.selectLesson(lessonID);
        // console.log(lessonID);
    };

    handleUnselectLesson = (lessonID) => {
        // this.props.unselectLesson(lessonID);
        // console.log(lessonID);
    };

    render = () => {
        if (this.state.loading) {
            return <Spinner />;
        } else {
            return (
                <div>
                    {(this.props.items && this.props.items.length > 0) ||
                    (this.state.items && this.state.items.length > 0) ? (
                        <>
                            <ConfirmationModal
                                show={this.state.modalShow}
                                hideModal={() => {
                                    this.setState({
                                        modalShow: false,
                                    });
                                }}
                                confirmAction={this.state.modalAction}
                                titleText={'Are you sure?'}
                                bodyText={[
                                    'You are about to ',
                                    <strong key='modal-type'>{this.state.modalType}</strong>,
                                    ' this ',
                                    `${this.state.typeTitle}.${
                                        this.state.modalType == 'clone' && ' Any unsaved changes will be lost.'
                                    }`,
                                ]}
                            />
                            <FormGroup>
                                <p className='form-label'>
                                    {this.state.typeTitle === 'Package' ? 'Upsell Package' : this.state.typeTitle}s
                                </p>
                            </FormGroup>
                        </>
                    ) : (
                        <></>
                    )}
                    <DragDropContext onDragEnd={this.handleDragAndDrop}>
                        <Droppable droppableId={this.props.type}>
                            {(provided) => (
                                <>{this.renderAs(this.props.type === 'lesson' ? 'table' : 'cards', provided)}</>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <br />
                    {!this.props.parentsCoreLink ? (
                        <AddOrSearchBar
                            type={this.props.type}
                            source={this.props.source}
                            addNewItem={this.addNewItem}
                            existingItems={this.props.items ?? this.state.items}
                            coreKey={this.state.coreKey}
                            refreshLinkedOptions={this.state.refreshLinkedOptions}
                            unsetRefreshLinkedOptions={this.unsetRefreshLinkedOptions}
                            parentDocId={this.props.parentDocId}
                        />
                    ) : (
                        <></>
                    )}
                </div>
            );
        }
    };

    renderAs = (what, provided) => {
        if (what === 'table') {
            return (
                <div className='table'>
                    {(this.props.items ? this.props.items : this.state.items).length ? (
                        <div className='header'>
                            <div className='col' style={{ maxWidth: '45px' }}></div>
                            <div className='col' style={{ minWidth: '30%' }}>
                                Lesson Name
                            </div>
                            <div className='col'>Progress Time</div>
                            <div className='col'>Required Time</div>
                            <div className='col' style={{ minWidth: '20%' }}>
                                Unlock Next Lesson
                            </div>
                            <div className='col'></div>
                        </div>
                    ) : (
                        <>No lessons.</>
                    )}
                    <div
                        className='main'
                        style={{
                            minWidth: 'auto',
                        }}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                    >
                        {(this.props.items ? this.props.items : this.state.items).map((item, i) => {
                            // console.log(item);
                            const draggableId = this.props.type !== 'package' ? item.draggableId : item;
                            return (
                                <Draggable
                                    isDragDisabled={Boolean(this.props.parentsCoreLink)}
                                    key={`draggable${this.state.typeTitle}-${draggableId}`}
                                    draggableId={`draggable${this.state.typeTitle}-${draggableId}`}
                                    index={i}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            className='row'
                                            key={`itemCard-${item._id}`}
                                            {...provided.draggableProps}
                                        >
                                            <ItemCard
                                                selectedLessons={this.props.selectedLessons}
                                                selectLesson={this.handleSelectLesson}
                                                unselectLesson={this.handleUnselectLesson}
                                                dragHandleProps={provided.dragHandleProps}
                                                key={`itemCard${this.state.typeTitle}-${item._id}-${
                                                    item[this.state.coreKey]
                                                }`}
                                                type={this.props.type}
                                                source={this.props.source}
                                                coreKey={this.state.coreKey}
                                                item={item}
                                                itemIdx={i}
                                                accordionOpen={
                                                    this.state.params.focus && this.state.params.focus === item._id
                                                }
                                                deleteItem={this.deleteItem}
                                                unlinkItem={this.unlinkItem}
                                                addNewItem={this.props.addNewItem}
                                                doSubmit={this.props.doSubmit}
                                                parentDocId={this.props.parentDocId}
                                                parentsCoreLink={this.props.parentsCoreLink}
                                                cloneItem={this.cloneItem}
                                                setIsDirty={this.props.setIsDirty}
                                                updateRegister={this.props.updateRegister}
                                                updateStateItem={this.updateStateItem}
                                                updateMasterTime={this.props.updateMasterTime}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                </div>
            );
        } else {
            return (
                <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{
                        listStyleType: 'none',
                        padding: '0px',
                        margin: '0px',
                    }}
                >
                    {(this.props.items ? this.props.items : this.state.items).map((item, i) => {
                        const draggableId = this.props.type !== 'package' ? item.draggableId : item;
                        return (
                            <Draggable
                                isDragDisabled={Boolean(this.props.parentsCoreLink)}
                                key={`draggable${this.state.typeTitle}-${draggableId}`}
                                draggableId={`draggable${this.state.typeTitle}-${draggableId}`}
                                index={i}
                            >
                                {(provided) => (
                                    <li className='li_admin' ref={provided.innerRef} {...provided.draggableProps}>
                                        <div ref={item.ref} className='my-2' key={`itemCard-${item._id}`}>
                                            <ItemCard
                                                selectedLessons={this.props.selectedLessons}
                                                selectLesson={this.handleSelectLesson}
                                                unselectLesson={this.handleUnselectLesson}
                                                dragHandleProps={provided.dragHandleProps}
                                                key={`itemCard${this.state.typeTitle}-${item._id}-${
                                                    item[this.state.coreKey]
                                                }`}
                                                type={this.props.type}
                                                source={this.props.source}
                                                coreKey={this.state.coreKey}
                                                item={item}
                                                itemIdx={i}
                                                accordionOpen={
                                                    this.state.params.focus && this.state.params.focus === item._id
                                                }
                                                deleteItem={this.deleteItem}
                                                unlinkItem={this.unlinkItem}
                                                addNewItem={this.props.addNewItem}
                                                doSubmit={this.props.doSubmit}
                                                parentDocId={this.props.parentDocId}
                                                parentsCoreLink={this.props.parentsCoreLink}
                                                cloneItem={this.cloneItem}
                                                setIsDirty={this.props.setIsDirty}
                                                updateRegister={this.props.updateRegister}
                                                updateStateItem={this.updateStateItem}
                                                updateMasterTime={this.props.updateMasterTime}
                                                updateItem={this.updateItem}
                                            />
                                        </div>
                                    </li>
                                )}
                            </Draggable>
                        );
                    })}
                    {provided.placeholder}
                </ul>
            );
        }
    };
}

export default connect(null, {
    setGlobalAlert: (payload) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(ContentItems));
