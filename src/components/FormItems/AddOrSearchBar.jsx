import React, { Component } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { Form, Row, Col, FormGroup, Button } from 'react-bootstrap';
import uuid from 'react-uuid';
import apiCall from '../../helpers/apiCall';

export default class AddOrSearchBar extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);

        this.state = {
            typeTitle: props.type[0].toUpperCase() + props.type.substr(1).toLowerCase(),
            newItemTitle: '',
            coreLibraryOpts: [],
            selectedCoreLibraryId: null,
            selectedChildItem: null,
            selectedChildItemInputVal: '',
            inputTree: ['course', 'package'].indexOf(this.props.type) >= 0,
        };
    }

    handleChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    };

    getEmptyItem = () => {
        let item = null;
        let randomId = uuid();
        if (this.props.type === 'chapter') {
            item = {
                _id: randomId,
                draggableId: randomId,
                title: '',
                chapterTime: 0,
                isNew: true,
            };
        } else if (this.props.type === 'lesson') {
            item = {
                _id: randomId,
                lessonLayout: 'PAGE',
                draggableId: randomId,
                title: '',
                lessonTime: 0,
                isNew: true,
                conditionStatement: 'ALL_TIME',
            };
        } else if (this.props.type === 'course') {
            item = {
                draggableId: randomId,
                courseId: this.state.selectedChildItem._id,
                conditionStatement: 'ANY_TIME',
            };
        } else {
            throw new Error('Unrecognized item type!');
        }
        item.title = this.state.newItemTitle;
        return item;
    };

    componentDidMount = async () => {
        this._isMounted = true;
        if (this.props.source !== 'core') {
            const { success, response } = await apiCall('GET', '/core');
            if (success && this._isMounted) {
                const coreLibraryOpts = response.docs.map((library) => {
                    return {
                        label: library.title,
                        value: library._id,
                        library,
                    };
                });

                this.setState({
                    coreLibraryOpts: coreLibraryOpts,
                });
            }
        }
    };

    componentWillUnmount = () => {
        this._isMounted = false;
    };

    loadOptions = async (inputValue) => {
        let url;

        if (this.props.type === 'course') {
            url = '/all-courses';
        } else if (this.props.type === 'package') {
            url = '/packages';
        } else {
            url = `/core/${this.props.type}s/core/${this.state.selectedCoreLibraryId}`;
        }

        const { success, response } = await apiCall('GET', `${url}?search=${encodeURI(inputValue)}`);

        let docs = [];

        if (success && this._isMounted) {
            if (this.props.type === 'package') {
                docs = response.docs;
            } else if (this.props.type === 'course') {
                docs = response;
            } else if (this.props.type === 'chapter') {
                docs = response.chapters;
            } else {
                docs = response;
            }

            docs = docs.filter((doc) => {
                if (doc._id === this.props.parentDocId) {
                    return false;
                }
                return this.props.existingItems.every((item) => {
                    if (this.props.type === 'course') {
                        return item.courseId !== doc._id;
                    } else if (this.props.type === 'package') {
                        return item !== doc._id;
                    } else {
                        return item[this.props.coreKey] !== doc._id;
                    }
                });
            });
        }

        this.props.unsetRefreshLinkedOptions();
        return docs;
    };

    render() {
        return (
            <div>
                <FormGroup>
                    <p>Add new {this.props.type === 'package' ? 'upsell package' : this.props.type}</p>
                </FormGroup>
                <Row>
                    {!this.state.inputTree && (
                        <>
                            <Col md={9} xl={this.props.source === 'core' ? 9 : 3}>
                                <Form.Control
                                    type='text'
                                    minLength='3'
                                    maxLength='512'
                                    id='newItemTitle'
                                    name='newItemTitle'
                                    placeholder={`${this.state.typeTitle} title`}
                                    value={this.state.newItemTitle}
                                    onChange={this.handleChange}
                                    className='my-2 my-md-0'
                                />
                            </Col>
                            <Col md={3} xl={this.props.source === 'core' ? 3 : 2}>
                                <Button
                                    disabled={!this.state.newItemTitle}
                                    type='button'
                                    variant='dark'
                                    className='form-control my-2 my-md-0'
                                    onClick={() => {
                                        this.props.addNewItem(this.getEmptyItem());
                                        this.setState({
                                            newItemTitle: '',
                                        });
                                    }}
                                >
                                    <strong>Create</strong>
                                </Button>
                            </Col>
                            {this.props.source !== 'core' ? (
                                <>
                                    <Col md={12} xl={1} className='text-center my-2'>
                                        <strong>OR</strong>
                                    </Col>
                                    <Col md={5} xl={2}>
                                        <Select
                                            options={this.state.coreLibraryOpts}
                                            value={this.state.selectedCoreLibraryId ? undefined : ''}
                                            menuPortalTarget={document.body}
                                            menuPosition={'fixed'}
                                            onChange={async (opt) => {
                                                this.setState({
                                                    selectedCoreLibraryId: opt.value,
                                                    selectedChildItem: null,
                                                });
                                            }}
                                            styles={{
                                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                            }}
                                            closeMenuOnScroll={(event) => {
                                                return event.target.id === 'mainContainerId';
                                            }}
                                            id='coreLibary'
                                            placeholder='Select Core Library'
                                            className='my-2 my-md-0'
                                        />
                                    </Col>
                                </>
                            ) : (
                                <></>
                            )}
                        </>
                    )}
                    {this.props.source !== 'core' ? (
                        <>
                            <Col xs={12} md={this.state.inputTree ? 9 : 5} xl={this.state.inputTree ? 9 : 3}>
                                {this.state.selectedCoreLibraryId || this.state.inputTree ? (
                                    <AsyncSelect
                                        key={`${this.state.typeTitle}Select-${this.state.selectedCoreLibraryId}-${this.props.refreshLinkedOptions}`}
                                        id={`${this.state.typeTitle}Select-${this.state.selectedCoreLibraryId}`}
                                        placeholder={`Search ${this.state.typeTitle}`}
                                        defaultOptions
                                        cacheOptions
                                        menuPortalTarget={document.body}
                                        menuPosition={'fixed'}
                                        loadOptions={this.loadOptions}
                                        getOptionLabel={(e) => e.title}
                                        getOptionValue={(e) => e._id}
                                        styles={{
                                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        }}
                                        closeMenuOnScroll={(event) => {
                                            return event.target.id === 'mainContainerId';
                                        }}
                                        onChange={(opt) => {
                                            this.setState({
                                                selectedChildItem: opt,
                                            });
                                        }}
                                        onInputChange={(inputVal) => {
                                            this.setState({
                                                selectedChildItemInputVal: inputVal,
                                            });
                                        }}
                                        value={this.state.selectedChildItem}
                                        inputValue={this.state.selectedChildItemInputVal}
                                        className='my-2 my-md-0'
                                    />
                                ) : (
                                    <Select
                                        isDisabled
                                        placeholder={`Search ${this.state.typeTitle}`}
                                        className='my-2 my-md-0'
                                    />
                                )}
                            </Col>
                            <Col xs={12} md={this.state.inputTree ? 3 : 2} xl={this.state.inputTree ? 3 : 1}>
                                <Button
                                    disabled={!this.state.selectedChildItem}
                                    type='button'
                                    variant='dark'
                                    className='form-control my-2 my-md-0'
                                    onClick={() => {
                                        let newItem;

                                        if (this.props.type !== 'package') {
                                            const emptyItem = this.getEmptyItem();
                                            newItem = {
                                                ...emptyItem,
                                                ...this.state.selectedChildItem,
                                                conditionStatement: emptyItem.conditionStatement,
                                            };
                                            if (this.props.type !== 'course') {
                                                newItem['core' + this.state.typeTitle + 'sLink'] =
                                                    this.state.selectedChildItem._id;
                                            }
                                            if (this.props.type === 'chapter') {
                                                newItem.coreLibraryId = this.state.selectedCoreLibraryId;
                                            }
                                        } else {
                                            newItem = this.state.selectedChildItem._id;
                                        }

                                        this.props.addNewItem({
                                            ...newItem,
                                            conditionStatement: 'ANY_TIME',
                                        });
                                        this.setState({
                                            selectedChildItem: null,
                                            selectedChildItemInputVal: '',
                                        });
                                    }}
                                >
                                    <strong>Add</strong>
                                </Button>
                            </Col>
                        </>
                    ) : (
                        <></>
                    )}
                </Row>
            </div>
        );
    }
}
