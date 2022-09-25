import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Col, Row, Form, FormGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import ItemCard from './ItemCard';
import { Spinner } from '../../../components/Spinner';
import apiCall from '../../../helpers/apiCall';
import uuid from 'react-uuid';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { RouteLeavingGuard } from '../../../components/RouteLeavingGuard';
import CourseFormPreview from './CourseFormPreview';

class CourseFormInputs extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            tabType: this.props.tab.charAt(0).toLowerCase() + this.props.tab.slice(1),
            type: this.props.tab === 'PreExam' || this.props.tab === 'PostExam' ? 'exam' : 'enrollment',
            subtype: this.props.tab === 'PreExam' ? 'pre' : this.props.tab === 'PostExam' ? 'post' : 'enrollment',
            objectId: null,
            items: [],
            isDirty: false,
        };
    }

    handleFileChange = (item, name, file) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (item.uuid === thisItem.uuid) {
                    file.customFieldName = name;
                    thisItem.file = file;
                }
                return thisItem;
            }),
        });
    };

    handleSubmit = (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setState({
            loading: true,
            isDirty: false,
        });
        this.submit();
    };

    submit = async () => {
        const uploadPromises = this.state.items.map(async (item) => {
            if (item.file) {
                let filePostData = new FormData();
                const customFieldName = item.file.customFieldName;
                filePostData.append('file', item.file);
                return apiCall('POST', '/files', filePostData).then(({ success, response }) => {
                    if (success && this._isMounted) {
                        this.setState({
                            items: this.state.items.map((thisItem) => {
                                if (item.uuid === thisItem.uuid) {
                                    delete thisItem.file;
                                    thisItem[customFieldName] = response.fileId;
                                }
                                return thisItem;
                            }),
                        });
                    }
                });
            }
        });

        await Promise.all(uploadPromises);

        let submitMethod = 'POST';
        let submitUrl = `/courses/${this.state.type}s/`;

        if (this.state.subtype !== 'enrollment') {
            submitUrl = `/courses/${this.props.match.params.courseId}/exams/${this.state.subtype}`;
        }

        if (this.state.subtype === 'enrollment' && this.state.objectId) {
            submitMethod = 'PUT';
            submitUrl = `/courses/enrollments/${this.state.objectId}`;
        }

        const { success, response, message } = await apiCall(submitMethod, submitUrl, {
            fields: this.state.items,
            courseId: this.props.match.params.courseId,
        });

        if (this._isMounted) {
            if (success && response) {
                this.setState({
                    objectId: response._id,
                });
                this.props.setGlobalAlert({
                    type: 'success',
                    message: message ?? `${this.props.tab} has been ${this.state.objectId ? 'updated' : 'created'}`,
                });
            } else {
                this.props.setGlobalAlert({
                    type: 'error',
                    message: message ?? `There was a problem with saving this ${this.props.tab}. Please try again`,
                });
            }

            this.setState({
                loading: false,
            });
        }
    };

    componentDidMount = async () => {
        this._isMounted = true;
        const { success, response } = await apiCall(
            'GET',
            `/courses/${this.props.match.params.courseId}/${this.state.type}`
        );

        if (success && response && this._isMounted) {
            this.setState({
                items: response[this.state.tabType === 'enrollment' ? 'fields' : this.state.tabType + 'Fields'].map(
                    (item) => {
                        return {
                            ...item,
                            uuid: item._id,
                        };
                    }
                ),
                objectId: response._id,
            });
        }
        this.props.createFormActions({
            save: true,
            cancel: true,
            id: `${this.props.tab}Form`,
        });

        if (this._isMounted) {
            this.setState({
                loading: false,
            });
        }
    };

    componentDidUpdate() {
        if (this.props.formActions.state && this.props.formActions.state.reload) {
            this.props.history.push('/admin/courses');
        }
    }

    componentWillUnmount = () => {
        this._isMounted = false;
        this.props.createFormActions({});
    };

    deleteItem = (idx) => {
        this.setState({
            items: this.state.items.filter((item, index) => {
                return idx != index;
            }),
            isDirty: true,
        });
    };

    getEmptyItem(inputType) {
        let item = {
            inputType,
            label: '',
            required: false,
            key: inputType === 'social security number' ? 'ssnKey' : inputType === 'date of birth' ? 'dobKey' : '',
            description: '',
            extra: {},
            uuid: uuid(),
        };

        if (inputType === 'file') {
            item.extra.allowedFileTypes = [];
        } else if (inputType === 'textBlock') {
            item.extra.copy = '';
        } else if (inputType === 'document' || inputType === 'image') {
            item.extra.sourceUrl = '';
        } else if (inputType === 'radio' || inputType === 'dropdown' || inputType === 'options') {
            item.extra.options = [];
        } else if (inputType === 'checkbox') {
            item.extra.options = [{ required: false, value: '' }];
            item.extra.multiple = false;
        } else if (inputType === 'social security number') {
            item.extra.numberOfDigits = 4;
        }
        return item;
    }

    handleChange = (itemIdx, attribute, value) => {
        const newItems = this.state.items.map((item, idx) => {
            if (idx === itemIdx) {
                let parts = attribute.split('.'),
                    last = parts.pop(),
                    lastObj = parts.reduce((acc, cur) => acc?.[cur], item);

                if (typeof lastObj === 'object') {
                    lastObj[last] = value;
                }
            }
            return item;
        });

        this.setState({
            items: newItems,
            isDirty: true,
        });
    };

    handleExtraChange = (itemIdx, attribute, value) => {
        const newItems = this.state.items.map((item, idx) => {
            if (idx === itemIdx) {
                let parts = attribute.split('.'),
                    last = parts.pop(),
                    lastObj = parts.reduce((acc, cur) => acc?.[cur], item);

                if (typeof lastObj === 'object') {
                    lastObj['extra'][last] = value;
                }
            }
            return item;
        });

        this.setState({
            items: newItems,
            isDirty: true,
        });
    };

    handleOptionChange = (item, idx, value) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (thisItem.uuid === item.uuid) {
                    thisItem.extra.options[idx] = value;
                }
                return thisItem;
            }),
        });
    };

    handleCheckboxValueChange = (item, idx, value, label) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (thisItem.uuid === item.uuid) {
                    thisItem.extra.options[idx][label] = value;
                }
                return thisItem;
            }),
        });
    };

    handleMultipleChange = (item, multiple) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (item.uuid === thisItem.uuid) {
                    thisItem.extra.multiple = JSON.parse(multiple);
                }
                return thisItem;
            }),
        });
    };

    handleDragAndDrop = (result) => {
        if (!result.destination || result.source.index === result.destination.index) return;
        let items = [...this.state.items];

        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        this.setState({
            items,
            isDirty: true,
        });
    };

    addItemOption = (item, isFromCheckbox = false) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (thisItem.uuid === item.uuid) {
                    if (isFromCheckbox) {
                        thisItem.extra.options.push({ value: '', required: false });
                    } else {
                        thisItem.extra.options.push('');
                    }
                }
                return thisItem;
            }),
        });
    };

    removeItemOption = (item, idx) => {
        this.setState({
            items: this.state.items.map((thisItem) => {
                if (thisItem.uuid === item.uuid) {
                    thisItem.extra.options = thisItem.extra.options.filter((opt, thisIdx) => {
                        return idx !== thisIdx;
                    });
                }
                return thisItem;
            }),
        });
    };

    render() {
        if (this.state.loading) {
            return <Spinner />;
        } else {
            return (
                <div>
                    <RouteLeavingGuard
                        when={this.state.isDirty}
                        navigate={(path) => this.props.history.push(path)}
                        shouldBlockNavigation={() => {
                            return this.state.isDirty;
                        }}
                    />
                    <Form onSubmit={this.handleSubmit} id={`${this.props.tab}Form`} className='form-constructor'>
                        <header>
                            <div>{this.props.tab} Form Inputs</div>
                            <div>
                                <CourseFormPreview fields={this.state.items} />
                            </div>
                        </header>

                        <DragDropContext onDragEnd={this.handleDragAndDrop}>
                            <Droppable droppableId={this.props.tab}>
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
                                        {this.state.items.map((item, i) => {
                                            return (
                                                <Draggable
                                                    key={`draggable-${item.uuid}`}
                                                    draggableId={item.uuid}
                                                    index={i}
                                                >
                                                    {(provided) => (
                                                        <li
                                                            className='li_admin'
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <Row className='pt-2'>
                                                                <Col>
                                                                    <ItemCard
                                                                        idx={i}
                                                                        item={item}
                                                                        handleChange={this.handleChange}
                                                                        handleFileChange={this.handleFileChange}
                                                                        deleteItem={this.deleteItem}
                                                                        dragHandleProps={provided.dragHandleProps}
                                                                        addItemOption={this.addItemOption}
                                                                        removeItemOption={this.removeItemOption}
                                                                        handleOptionChange={this.handleOptionChange}
                                                                        handleMultipleChange={this.handleMultipleChange}
                                                                        handleCheckboxValueChange={
                                                                            this.handleCheckboxValueChange
                                                                        }
                                                                        handleExtraChange={this.handleExtraChange}
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

                        <Row className='pt-5'>
                            <Col xs={6} md={3}>
                                <DropdownButton title='Form Inputs' id='buttonDropdown' variant='btn bd w-100'>
                                    {[
                                        'text',
                                        'number',
                                        'date',
                                        'file',
                                        'textarea',
                                        'dropdown',
                                        'checkbox',
                                        'radio',
                                        'social security number',
                                        'date of birth',
                                    ].map((type, i) => {
                                        return (
                                            <Dropdown.Item
                                                key={i}
                                                eventKey={i}
                                                onClick={() => {
                                                    this.setState({
                                                        items: [...this.state.items, this.getEmptyItem(type)],
                                                    });
                                                }}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Dropdown.Item>
                                        );
                                    })}
                                </DropdownButton>
                            </Col>
                            <Col xs={6} md={3}>
                                <DropdownButton title='Content Blocks' id='buttonDropdown' variant='btn bd w-100'>
                                    {['textBlock', 'document', 'image'].map((type, i) => {
                                        return (
                                            <Dropdown.Item
                                                key={i}
                                                eventKey={i}
                                                onClick={() => {
                                                    this.setState({
                                                        items: [...this.state.items, this.getEmptyItem(type)],
                                                    });
                                                }}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </Dropdown.Item>
                                        );
                                    })}
                                </DropdownButton>
                            </Col>
                        </Row>
                    </Form>
                </div>
            );
        }
    }
}

export default connect(
    (state) => {
        return {
            formActions: state.formActions,
        };
    },
    {
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
        createFormActions: (payload) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
    }
)(withRouter(CourseFormInputs));
