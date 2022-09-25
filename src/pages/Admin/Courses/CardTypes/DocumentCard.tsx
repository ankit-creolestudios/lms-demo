import React, { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import ThemeOptions from 'src/pages/Admin/Courses/Lesson/CardTypes/ThemeOptions';
import TextInput from 'src/components/inputs/TextInput';
import './CardTypes.scss';
import { AsyncPreviewFileUpload } from 'src/components/FileUpload';
import Editor from 'src/components/Editor';

interface IProps {
    theme: string;
    content: string;
    info: string;
    heading: string;
    sourceDocument: any;
    idx: string;
    handleContentBlockChange: any;
    handleFileChange: any;
}

type TProps = IProps;

interface IState {
    theme: string;
    content: string;
    info: string;
    sourceDocument: string | any;
    heading: string;
}

export default class DocumentCard extends Component<TProps, IState> {
    state: IState = {
        theme: this.props.theme ?? '',
        sourceDocument: this.props.sourceDocument ?? '',
        heading: this.props.heading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;

        this.setState({ [input.name]: input.value } as unknown as Pick<IState, keyof IState>);
        this.props.handleContentBlockChange(this.props.idx, input.name, input.value);
    };

    handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, file: any) => {
        const name = e.target.name;
        const val = e.target.value;

        this.setState({ [name]: file } as unknown as Pick<IState, keyof IState>);
        if (file) this.props.handleFileChange(name, file, val);
    };

    render() {
        const {
            state: { sourceDocument, heading, content, theme, info },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor='heading'>Heading</label>
                    <TextInput type='text' name='heading' defaultValue={heading} onChange={this.handleInputChange} />
                </div>
                <div>
                    <label htmlFor='content'>Content</label>
                    <Editor defaultValue={content} name='content' onChange={this.handleInputChange} />
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload document'
                        type='document'
                        name='sourceDocument'
                        file={sourceDocument}
                        onChange={this.handleFileChange}
                    />
                </div>
                <Accordion as='footer' className='lesson-cards__item__extras'>
                    <Accordion.Toggle as='button' className='bd' eventKey='0'>
                        Extras
                    </Accordion.Toggle>
                    <Accordion.Collapse eventKey='0'>
                        <main>
                            <div>
                                <label htmlFor='info'>Info</label>
                                <Editor defaultValue={info} name='info' onChange={this.handleInputChange} />
                            </div>
                        </main>
                    </Accordion.Collapse>
                </Accordion>
            </>
        );
    }
}
