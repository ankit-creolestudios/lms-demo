import React, { Component } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Accordion } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import Field, { IField } from './Field';
import AddNewItemBar from 'src/pages/Admin/Courses/Tabs/AddNewItemBar';
export type { IField };
import './Fields.scss';

interface IProps {
    fields: IField[];
    onChange: (ReportSettings: IField[]) => void;
}

export default class Fields extends Component<IProps> {
    handleDragAndDropField = (result: any): void => {
        if (!result.destination || result.destination.index === result.source.index) return;

        const fields: IField[] = this.props.fields.slice();
        const [field] = fields.splice(result.source.index, 1);
        fields.splice(result.destination.index, 0, field);
        this.props.onChange(fields);
    };

    updateField = (fieldIndex: number, field: IField): void => {
        const fields = this.props.fields.slice();
        fields[fieldIndex] = field;
        this.props.onChange(fields);
    };

    deleteField = (fieldIndex: number) => {
        const fields: IField[] = this.props.fields.slice();
        fields.splice(fieldIndex, 1);
        this.props.onChange(fields);
    };

    addNewField = (title: string) => {
        const fields = this.props.fields.slice();
        const newField: IField = {
            id: uuid(),
            title,
            data: [{ target: 'code' }],
        };
        fields.push(newField);
        this.props.onChange(fields);
    };

    render() {
        const { fields } = this.props;
        return (
            <div className='discount-report-fields'>
                <h6>Fields</h6>
                <Accordion className='table-tree'>
                    <DragDropContext onDragEnd={this.handleDragAndDropField}>
                        <Droppable droppableId='droppable-fields'>
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {fields.map((field: IField, index: number) => {
                                        return (
                                            <Draggable
                                                key={`draggable-${field.id}`}
                                                draggableId={`draggable-${field.id}`}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <Field
                                                        provided={provided}
                                                        index={index}
                                                        field={field}
                                                        updateField={this.updateField}
                                                        deleteField={this.deleteField}
                                                    />
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </Accordion>
                <AddNewItemBar type='Field' addNewItem={this.addNewField} />
            </div>
        );
    }
}
