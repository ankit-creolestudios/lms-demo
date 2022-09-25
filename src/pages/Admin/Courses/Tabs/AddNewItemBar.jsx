import React, { Component } from 'react';
import { Form, Button, Row, Col, Modal } from 'react-bootstrap';
import CoreLibraryContent from './Course/CoreLibraryContent';

export default class AddNewItemBar extends Component {
    state = {
        title: '',
        showManageModal: false,
    };

    handleTitleChange = (event) => {
        this.setState({
            title: event.target.value,
        });
    };

    closeManageModal = () => {
        this.setState({ showManageModal: false });
    };

    render() {
        return (
            <div className='pt-4 add-new-item-bar-component'>
                <label htmlFor='newItemTitle'>
                    {this.props.source === 'core' ? 'Create' : 'Add'} New {this.props.type}
                    {this.props.source !== 'core' && this.props.type === 'lesson' && (
                        <>
                            <span
                                className='insert-link'
                                onClick={() => {
                                    this.setState({ showManageModal: true });
                                }}
                            >
                                {' '}
                                or insert from core library{' '}
                            </span>
                            <i className='fa fa-file-alt'></i>
                        </>
                    )}
                </label>
                <div>
                    <Row>
                        <Col md={this.props.source === 'core' ? 9 : 10} xl={this.props.source === 'core' ? 9 : 10}>
                            <Form.Control
                                type='text'
                                minLength='3'
                                maxLength='512'
                                name='newItemTitle'
                                placeholder={`${this.props.type[0].toUpperCase() + this.props.type.substr(1)} Title`}
                                value={this.state.title}
                                onChange={this.handleTitleChange}
                                className='my-2 my-md-0'
                            />
                        </Col>
                        <Col md={this.props.source === 'core' ? 3 : 2} xl={this.props.source === 'core' ? 3 : 2}>
                            <Button
                                disabled={!this.state.title}
                                variant='link'
                                type='button'
                                className='form-control my-2 my-md-0'
                                onClick={() => {
                                    this.props.addNewItem(
                                        this.state.title,
                                        this.props.type,
                                        this.props.parentId,
                                        this.props.numOfItems
                                    );
                                    this.setState({
                                        title: '',
                                    });
                                }}
                            >
                                <strong>
                                    Create{' '}
                                    {this.props.source === 'core' && this.props.type === 'chapter' ? 'Chapter' : ''}
                                    {this.props.source === 'core' && this.props.type === 'Lesson' ? 'Lesson' : ''}
                                </strong>
                            </Button>
                        </Col>
                    </Row>
                    <Modal
                        enforceFocus={false}
                        dialogClassName='modal-90w admin-modal'
                        show={this.state.showManageModal}
                        onHide={this.closeManageModal}
                        backdrop='static'
                        keyboard={false}
                    >
                        <Modal.Header closeButton>
                            <Modal.Title>Add Lesson(s) from Core </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className='pt-0 pb-4 header-labels'>
                            <CoreLibraryContent
                                courseChapterId={this.props?.parentId}
                                closeManageModal={this.closeManageModal}
                                loadData={this.props.loadData}
                                numOfItems={this.props.numOfItems}
                            />
                        </Modal.Body>
                    </Modal>
                </div>
            </div>
        );
    }
}

