import React, { Component } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { Accordion, Card, FormGroup, Form, Button } from 'react-bootstrap';
import { IDataTarget } from '../ReportingInputs';
import { IField, TData, TSorting, IOptions } from '../ReportingFields';
import { SourceOptions } from './SourceOptions/SourceOptions';
import Source from './Source';
import './Body.scss';

interface IProps {
    field: IField;
    index: number;
    onChange: (key: 'data' | 'sorting', value: TData | TSorting) => void;
    availableDataTargets: IDataTarget[];
}
interface IState {
    field: IField;
    activeOptions: number | null;
}

export class Body extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            field: props.field,
            activeOptions: null,
        };
    }

    componentDidUpdate(prevProps: IProps) {
        if (JSON.stringify(prevProps.field) !== JSON.stringify(this.props.field)) {
            this.setState({ field: this.props.field });
        }
    }

    handleSourceChange = (index: number, value: string) => {
        const field = Object.assign({}, this.state.field);
        const target = this.props.availableDataTargets.find((target) => target.path === value);

        field.data[index].target = value;
        field.data[index].options.type = target?.type ?? 'string';

        this.setState({ field });
        this.props.onChange('data', field.data);
    };

    addNewSource = (currentIndex: number) => {
        const field = Object.assign({}, this.state.field);
        const newSource = {
            target: this.props.availableDataTargets[0].path,
            options: { type: this.props.availableDataTargets[0].type, prependString: ' ' },
        };
        field.data.splice(currentIndex + 1, 0, newSource);
        this.setState({ field });
        this.props.onChange('data', field.data);
    };

    deleteSource = (index: number) => {
        const field = Object.assign({}, this.state.field);
        field.data.splice(index, 1);
        this.setState({ field });
        this.props.onChange('data', field.data);
    };

    setActiveOptions = (index: number) => {
        let activeOptions = this.state.activeOptions;
        if (activeOptions === null || activeOptions !== index) {
            activeOptions = index;
        } else {
            activeOptions = null;
        }

        this.setState({ activeOptions });
    };

    closeSouceOptions = () => {
        this.setState({ activeOptions: null });
    };

    handleOptionsChange = (index: number, name: keyof IOptions, value: any) => {
        const field = Object.assign({}, this.state.field);
        //@ts-ignore
        field.data[index].options[name] = value;
        this.setState({ field });
        this.props.onChange('data', field.data);
    };

    handleDragAndDropSource = (result: any, provided: any): void => {
        if (!result.destination || result.destination.index === result.source.index) return;

        const sources: TData = this.state.field.data.slice();
        const [source] = sources.splice(result.source.index, 1);
        sources.splice(result.destination.index, 0, source);

        const field = {
            ...this.state.field,
            data: sources,
        };
        this.setState({ field });
        this.props.onChange('data', field.data);
    };

    render() {
        const { field, activeOptions } = this.state;

        return (
            <Accordion.Collapse className='rf-field-card-body' eventKey={`draggable-${field.id}`}>
                <Card.Body>
                    <FormGroup className='targets'>
                        <DragDropContext onDragEnd={this.handleDragAndDropSource}>
                            <Droppable droppableId='droppable-sources'>
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef}>
                                        {field.data.map((source, index) => {
                                            source.target = source.target || this.props.availableDataTargets[0].path;
                                            return (
                                                <Draggable
                                                    key={`draggable-${index}`}
                                                    draggableId={`draggable-${index}`}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <Source
                                                            sourceLength={field.data.length}
                                                            provided={provided}
                                                            source={source}
                                                            index={index}
                                                            availableDataTargets={this.props.availableDataTargets}
                                                            activeOptions={activeOptions}
                                                            handleChange={this.handleSourceChange}
                                                            deleteSource={this.deleteSource}
                                                            addNewSource={this.addNewSource}
                                                            setActiveOptions={this.setActiveOptions}
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
                    </FormGroup>
                    {activeOptions !== null && (
                        <div className='source-options-container'>
                            <SourceOptions
                                index={activeOptions}
                                options={field.data[activeOptions].options}
                                closeSouceOptions={this.closeSouceOptions}
                                handleChange={this.handleOptionsChange}
                            />
                        </div>
                    )}
                </Card.Body>
            </Accordion.Collapse>
        );
    }
}
