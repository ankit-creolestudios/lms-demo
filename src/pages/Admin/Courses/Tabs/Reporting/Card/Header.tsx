import React, { Component } from 'react';
import { Accordion, Card, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsAlt, faPencilAlt, faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { TControlledField } from './ReportingFieldCard';

interface IProps {
    provided: any;
    field: TControlledField;
    handleFieldTitleChange: (title: string) => void;
    confirmTitleChange: () => void;
    cancelTitleChange: () => void;
    toggleEditTitle: () => void;
    deleteField: () => void;
    isPdf: boolean;
}

export class Header extends Component<IProps, unknown> {
    render() {
        const { provided, field, isPdf } = this.props;
        return (
            <Card.Header {...provided.dragHandleProps}>
                <Accordion.Toggle as='div' className='field-header' eventKey={`draggable-${field.id}`}>
                    {!isPdf && <FontAwesomeIcon icon={faArrowsAlt} />}
                    {field.control.titleEditable === true ? (
                        <>
                            <Form.Control
                                className='d-inline-block'
                                type='text'
                                required
                                minLength={3}
                                maxLength={512}
                                name='title'
                                value={field.control.tempTitle ?? field.title}
                                onClick={(event: React.MouseEvent<HTMLInputElement>) => {
                                    event.stopPropagation();
                                }}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    this.props.handleFieldTitleChange(event.target.value);
                                }}
                            />
                            <div
                                className='rf-action confirm-wrapper'
                                onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                    event.stopPropagation();
                                    this.props.confirmTitleChange();
                                }}
                            >
                                <FontAwesomeIcon icon={faCheck} />
                            </div>
                            <div
                                className='rf-action cancel-wrapper'
                                onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                    event.stopPropagation();
                                    this.props.cancelTitleChange();
                                }}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </div>
                        </>
                    ) : (
                        <>
                            {field.title}
                            {!isPdf && (
                                <div
                                    className='rf-action edit-wrapper'
                                    onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                        event.stopPropagation();
                                        this.props.toggleEditTitle();
                                    }}
                                >
                                    <FontAwesomeIcon icon={faPencilAlt} />
                                </div>
                            )}
                        </>
                    )}
                    {!isPdf && (
                        <div
                            className='rf-action delete-wrapper'
                            onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                                event.stopPropagation();
                                this.props.deleteField();
                            }}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                    )}
                </Accordion.Toggle>
            </Card.Header>
        );
    }
}
