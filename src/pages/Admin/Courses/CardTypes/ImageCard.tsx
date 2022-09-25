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
    imageUrl: string;
    imagePosition: string;
    imageImportance: boolean;
    allowEnlargeImage: boolean;
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
    imageUrl: string;
    imagePosition: string;
    imageImportance: boolean;
    allowEnlargeImage: boolean;
}

export default class ImageCard extends Component<TProps, IState> {
    state: IState = {
        theme: this.props.theme ?? '',
        heading: this.props.heading ?? '',
        subHeading: this.props.subHeading ?? '',
        content: this.props.content ?? '',
        info: this.props.info ?? '',
        sourceImage: this.props.sourceImage ?? '',
        imageUrl: this.props.imageUrl ?? '',
        imagePosition: this.props.imagePosition ?? 'LEFT',
        imageImportance: this.props.imageImportance,
        allowEnlargeImage: this.props.allowEnlargeImage ?? false,
    };

    handleInputChange = (e: any) => {
        const input = e.target;
        let val;

        if (input.name === 'imageImportance') {
            val = input.value === 'preserveSizing' ? true : false;
        } else {
            val = input.value;
        }

        this.setState({ [input.name]: val } as unknown as Pick<IState, keyof IState>);
        this.props.handleContentBlockChange(this.props.idx, input.name, val);
    };

    handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name as keyof typeof this.state;
        this.setState({ [name]: !this.state[name] } as unknown as Pick<IState, keyof IState>);
        this.props.handleContentBlockChange(this.props.idx, name, !this.state[name]);
    };

    handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, file: any): void => {
        const name = e.target.name as keyof typeof this.state;
        const val = e.target.value as keyof typeof this.state;

        this.setState({ [name]: file } as unknown as Pick<IState, keyof IState>);
        if (file) this.props.handleFileChange(name, file, val);
    };

    render() {
        const {
            state: {
                heading,
                subHeading,
                content,
                sourceImage,
                imageUrl,
                imagePosition,
                info,
                theme,
                allowEnlargeImage,
            },
        } = this;

        const imageImportance = this.state.imageImportance ? 'preserveSizing' : 'default';

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
                    <ul>
                        <li>
                            <label htmlFor='imagePosition'>Image location</label>
                            <select name='imagePosition' value={imagePosition} onChange={this.handleInputChange}>
                                <option value='TOP'>Top</option>
                                <option value='LEFT'>Left</option>
                                <option value='RIGHT'>Right</option>
                                <option value='CENTER'>Center</option>
                                <option value='BG'>Background</option>
                            </select>
                        </li>
                        <li>
                            <label htmlFor='imageUrl'>External URL</label>
                            <input type='text' name='imageUrl' value={imageUrl} onChange={this.handleInputChange} />
                        </li>
                    </ul>
                </div>
                <div>
                    <AsyncPreviewFileUpload
                        label='Upload image'
                        type='image'
                        name='sourceImage'
                        file={sourceImage}
                        onChange={this.handleFileChange}
                    />
                </div>
                <div>
                    <label htmlFor='content'>Content</label>
                    <Editor defaultValue={content} name='content' onChange={this.handleInputChange} />
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
                            <div>
                                <label htmlFor='image-importance'>Image Importance</label>
                                <select
                                    name='imageImportance'
                                    defaultValue={imageImportance}
                                    onChange={this.handleInputChange}
                                >
                                    <option value='default'>Default</option>
                                    <option value='preserveSizing'>Preserve Sizing</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor='allowEnlargeImage'>
                                    Show image enlarge option?&nbsp;&nbsp;&nbsp;
                                    <input
                                        type='checkbox'
                                        name='allowEnlargeImage'
                                        checked={allowEnlargeImage}
                                        onChange={this.handleCheckboxClick}
                                    />
                                </label>
                            </div>
                        </main>
                    </Accordion.Collapse>
                </Accordion>
            </>
        );
    }
}
