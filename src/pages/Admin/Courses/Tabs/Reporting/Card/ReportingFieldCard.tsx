import React, { Component } from 'react';
import { Card } from 'react-bootstrap';
import { IField } from '../ReportingFields';
import { IDataTarget } from '../ReportingInputs';
import { Header } from './Header';
import { Body } from './Body';
import { TData, TSorting } from '../ReportingFields';
import './ReportingFieldCard.scss';

interface IProps {
    provided: any;
    field: IField;
    availableDataTargets: IDataTarget[];
    index: number;
    updateField: (fieldIndex: number, field: IField) => void;
    deleteField: (fieldIndex: number) => void;
    isPdf: boolean;
}

export type TControlledField = IField & TControl;

type IState = TControlledField;

type TControl = {
    control: IControl;
};

interface IControl {
    titleEditable: boolean;
    oldTitle: string | null;
    tempTitle: string | null;
}

export class ReportingFieldCard extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            ...props.field,
            control: {
                titleEditable: false,
                oldTitle: null,
                tempTitle: null,
            },
        };
    }

    componentDidUpdate(prevProps: IProps) {
        if (JSON.stringify(prevProps.field) !== JSON.stringify(this.props.field)) {
            this.setState({ ...this.props.field, control: this.state.control });
        }
    }

    handleFieldTitleChange = (title: string): void => {
        const control = this.state.control;
        if (control.oldTitle !== null) {
            control.oldTitle = this.state.title;
        }
        control.tempTitle = title;
        this.setState({ control });
    };

    toggleEditTitle = () => {
        this.setState({ control: { ...this.state.control, titleEditable: !this.state.control.titleEditable } });
    };

    confirmTitleChange = () => {
        const title = this.state.control.tempTitle !== null ? this.state.control.tempTitle : this.state.title;

        this.setState(
            {
                title: title as string,
                control: {
                    titleEditable: false,
                    oldTitle: null,
                    tempTitle: null,
                },
            },
            () => {
                this.update();
            }
        );
    };

    cancelTitleChange = () => {
        this.setState({
            control: {
                titleEditable: false,
                oldTitle: null,
                tempTitle: null,
            },
        });
    };

    handleBodyChange = (key: 'data' | 'sorting', value: TData | TSorting) => {
        this.setState({ ...this.state, [key]: value }, () => {
            this.update();
        });
    };

    deleteField = () => {
        this.props.deleteField(this.props.index);
    };

    update = () => {
        const { control: _control, ...field } = this.state;
        this.props.updateField(this.props.index, field);
    };

    render() {
        const field = this.state;
        const { provided, index, isPdf } = this.props;
        return (
            <Card
                className='reporting-field-card'
                key={`draggable-${field.id}`}
                ref={provided.innerRef}
                {...provided.draggableProps}
            >
                <Header
                    provided={provided}
                    field={field}
                    handleFieldTitleChange={this.handleFieldTitleChange}
                    toggleEditTitle={this.toggleEditTitle}
                    confirmTitleChange={this.confirmTitleChange}
                    cancelTitleChange={this.cancelTitleChange}
                    deleteField={this.deleteField}
                    isPdf={isPdf}
                />
                <Body
                    field={field}
                    index={index}
                    onChange={this.handleBodyChange}
                    availableDataTargets={this.props.availableDataTargets}
                />
            </Card>
        );
    }
}
