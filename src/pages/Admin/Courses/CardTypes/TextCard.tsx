import React, { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import ThemeOptions from 'src/pages/Admin/Courses/Lesson/CardTypes/ThemeOptions';
import TextInput from 'src/components/inputs/TextInput';
import './CardTypes.scss';
import { AsyncPreviewFileUpload } from 'src/components/FileUpload';
import Editor from 'src/components/Editor';

interface IProps {
    theme: string;
    heading: string;
    subHeading: string;
    content: string;
    info: string;
    sourceImage: any;
    idx: string;
    handleContentBlockChange: any;
    handleFileChange: any;
}
type TProps = IProps;

interface IState {
    theme: string;
    heading: string;
    subHeading: string;
    content: string;
    info: string;
    sourceImage: string | any;
}

export default class TextCard extends Component<TProps, IState> {
    state: IState = {
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
        sourceImage: this.props.sourceImage ?? '',
    };

    handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        this.setState({
            [input.name]: input.value,
        } as unknown as Pick<IState, keyof IState>);
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
            state: { heading, subHeading, content, info, sourceImage, theme },
        } = this;

        return (
            <>
                <ThemeOptions theme={theme} handleInputChange={this.handleInputChange} />
                <div>
                    <label htmlFor='heading'>Heading</label>
                    <TextInput type='text' name='heading' value={heading} onChange={this.handleInputChange} />
                </div>
                <div>
                    <label htmlFor='subHeading'>Subheading</label>
                    <TextInput type='text' name='subHeading' value={subHeading} onChange={this.handleInputChange} />
                </div>
                <div>
                    <label htmlFor='content'>Content</label>
                    <Editor defaultValue={content} name='content' onChange={this.handleInputChange} />
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload icon'
                        type='image'
                        name='sourceImage'
                        file={sourceImage}
                        onChange={this.handleFileChange}
                    />
                </div>
                <Accordion as='footer' className='card-types__item__extras'>
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
