import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import CourseContext from 'src/pages/Course/CourseContext';
import FormBuilder from '../../../components/FormBuilder/FormBuilder';

export default class CourseFormPreview extends Component {
    state = {
        showPreview: false,
    };

    togglePreview = (e) => {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            showPreview: !this.state.showPreview,
        });
    };

    render() {
        const {
            props: { fields },
            state: { showPreview },
        } = this;
        return (
            <CourseContext.Provider
                value={{
                    course: { lessonType: 'page' },
                }}
            >
                <button className='bp' onClick={this.togglePreview}>
                    Preview
                </button>
                <Modal size='xl' show={showPreview} className='form-constructor__preview' onHide={this.togglePreview}>
                    <Modal.Header closeButton>Form preview</Modal.Header>
                    <Modal.Body>
                        <FormBuilder fields={fields} />
                    </Modal.Body>
                </Modal>
            </CourseContext.Provider>
        );
    }
}
