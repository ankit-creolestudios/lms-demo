//@ts-nocheck
import React, { Component } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { IDataTarget } from '../ReportingInputs';
import { ITarget } from '../ReportingFields';

interface IProps {
    sourceLength: number;
    provided: any;
    source: ITarget;
    index: number;
    availableDataTargets: IDataTarget[];
    activeOptions: number | null;
    handleChange: (index: number, value: string) => void;
    deleteSource: (index: number) => void;
    addNewSource: (index: number) => void;
    setActiveOptions: (index: number) => void;
}

export default class Source extends Component<IProps, unknown> {
    render() {
        const { provided, source, index, activeOptions, sourceLength, availableDataTargets } = this.props;
        return (
            <div className='target' {...provided.draggableProps} {...provided.dragHandleProps} ref={provided.innerRef}>
                <div className='rf-action move-wrapper'>
                    <FontAwesomeIcon icon={faArrowsAlt} />
                </div>
                <Form.Control
                    as='select'
                    id='target'
                    name='target'
                    value={source.target}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        this.props.handleChange(index, event.target.value);
                    }}
                >
                    {availableDataTargets?.map((target: IDataTarget, targetIndex: number) => {
                        return (
                            <option key={targetIndex} value={target.path}>
                                {target.label}
                            </option>
                        );
                    })}
                </Form.Control>
                {sourceLength !== 1 && (
                    <div
                        className='rf-action delete-wrapper'
                        onClick={() => {
                            this.props.deleteSource(index);
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </div>
                )}
                <div
                    className='rf-action'
                    onClick={() => {
                        this.props.addNewSource(index);
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </div>
                <Button
                    className={activeOptions === index ? 'selected' : ''}
                    variant='link'
                    type='button'
                    onClick={() => {
                        this.props.setActiveOptions(index);
                    }}
                >
                    <strong>Options</strong>
                </Button>
            </div>
        );
    }
}
