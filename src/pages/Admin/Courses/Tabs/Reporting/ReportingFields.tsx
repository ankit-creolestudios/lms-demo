import React, { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { v4 as uuid } from 'uuid';
import { ReportingFieldCard } from './Card/ReportingFieldCard';
import AddNewItemBar from '../AddNewItemBar';
import { IDataTarget } from './ReportingInputs';
import './ReportingFields.scss';

export interface IField {
    id: string;
    title: string;
    data: TData;
    sorting?: TSorting;
}

export type TData = ITarget[];

export interface ITarget {
    target: string;
    options: IOptions;
}

export interface IOptions {
    type: 'string' | 'number' | 'date';
    capitalisation?: 'none' | 'capitalise' | 'uppercase' | 'lowercase';
    prependString?: string;
    appendString?: string;
    dateFormat?: 'date' | 'dateTime';
}

export type TSorting = any;

interface IProps {
    onChange: (fields: IField[]) => void;
    fields: IField[];
    availableDataTargets: IDataTarget[];
    isPdf: boolean;
    addNewSource?: (fields: IField[]) => void;
    updateSource?: (field: IField) => void;
    removeSource?: (fieldIndex: number) => void;
    dragAndDrop?: (fields: IField[]) => void;
}
interface IState {
    fields: IField[];
}

export class ReportingFields extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            fields: props.fields,
        };
    }

    componentDidUpdate(prevProps: IProps) {
        if (
            JSON.stringify(prevProps.fields) !== JSON.stringify(this.props.fields) ||
            prevProps.isPdf !== this.props.isPdf
        ) {
            this.setState({ fields: this.props.fields });
        }
    }

    update = (fields: IField[]) => {
        this.setState({ fields }, () => {
            this.props.onChange(fields);
        });
    };

    handleDragAndDropField = (result: any): void => {
        if (!result.destination || result.destination.index === result.source.index) return;

        const fields: IField[] = this.state.fields.slice();
        const [field] = fields.splice(result.source.index, 1);
        fields.splice(result.destination.index, 0, field);
        if (this.props.dragAndDrop) this.props.dragAndDrop(fields);
        this.update(fields);
    };

    updateField = (fieldIndex: number, field: IField): void => {
        const fields = this.state.fields.slice();
        fields[fieldIndex] = field;
        if (this.props.updateSource) this.props.updateSource(field);
        this.update(fields);
    };

    deleteField = (fieldIndex: number) => {
        const fields: IField[] = this.state.fields.slice();
        fields.splice(fieldIndex, 1);
        if (this.props.removeSource) this.props.removeSource(fieldIndex);
        this.update(fields);
    };

    addNewField = (title: string) => {
        const fields = this.state.fields.slice();
        const newField: IField = {
            id: uuid(),
            title,
            data: [{ target: '', options: { type: 'string' } }],
        };
        fields.push(newField);
        if (this.props.addNewSource) this.props.addNewSource(fields);
        this.update(fields);
    };

    render() {
        const { availableDataTargets, isPdf } = this.props;

        return (
            <div className='reporting-fields'>
                <Accordion className='table-tree'>
                    <DragDropContext onDragEnd={this.handleDragAndDropField}>
                        <Droppable droppableId='droppable-fields'>
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef}>
                                    {this.state.fields.map((field: IField, index: number) => {
                                        return (
                                            <Draggable
                                                key={`draggable-${field.id}`}
                                                draggableId={`draggable-${field.id}`}
                                                index={index}
                                                isDragDisabled={isPdf}
                                            >
                                                {(provided) => (
                                                    <ReportingFieldCard
                                                        provided={provided}
                                                        field={field}
                                                        availableDataTargets={availableDataTargets}
                                                        index={index}
                                                        updateField={this.updateField}
                                                        deleteField={this.deleteField}
                                                        isPdf={isPdf}
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
                {!isPdf && <AddNewItemBar type='Field' addNewItem={this.addNewField} />}
            </div>
        );
    }
}
