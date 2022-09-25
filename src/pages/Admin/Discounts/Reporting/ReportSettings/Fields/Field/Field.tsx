import React, { Component } from 'react';
import { Accordion, Card } from 'react-bootstrap';
import TargetSelection from '../TargetSelection';
import './Field.scss';

interface IProps {
    provided: any;
    index: number;
    field: IField;
    updateField: (fieldIndex: number, field: IField) => void;
    deleteField: (fieldIndex: number) => void;
}

export interface IField {
    id: string;
    title: string;
    data: IFieldData[];
}

interface IFieldData {
    target: string;
}

export default class Field extends Component<IProps> {
    handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { index, field } = this.props;
        field.title = e.currentTarget.value;
        this.props.updateField(index, field);
    };

    handleTargetChange = (target: string) => {
        const { index, field } = this.props;
        field.data[0].target = target;
        this.props.updateField(index, field);
    };

    deleteField = () => {
        this.props.deleteField(this.props.index);
    };

    render() {
        const { provided, index } = this.props;
        const { title, data } = this.props.field;
        return (
            <Card className='discount-report-field' ref={provided.innerRef} {...provided.draggableProps}>
                <Card.Header {...provided.dragHandleProps}>
                    <Accordion.Toggle as='div' className='field-header' eventKey={`draggable-${index}`}>
                        <i className='fa fa-arrows-alt' />
                        <input onChange={this.handleTitleChange} className='title-input' type='text' value={title} />
                        <div onClick={this.deleteField} className='delete-container'>
                            <i className='fa fa-trash' />
                        </div>
                    </Accordion.Toggle>
                </Card.Header>
                <Accordion.Collapse className='rf-field-card-body' eventKey={`draggable-${index}`}>
                    <Card.Body>
                        <TargetSelection currentTarget={data[0].target} onChange={this.handleTargetChange} />
                    </Card.Body>
                </Accordion.Collapse>
            </Card>
        );
    }
}
