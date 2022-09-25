import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default class ConfirmationModal extends Component {
    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.hideModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.props.titleText}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{this.props.bodyText}</Modal.Body>
                <Modal.Footer>
                    <Button variant='secondary' onClick={this.props.hideModal}>
                        {this.props.cancelButtonText || 'Cancel'}
                    </Button>
                    <Button variant='primary' onClick={this.props.confirmAction}>
                        {this.props.confirmButtonText || 'Confirm'}
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }
}
