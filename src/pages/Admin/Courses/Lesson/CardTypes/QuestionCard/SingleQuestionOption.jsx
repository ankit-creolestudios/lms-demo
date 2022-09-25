import React, { Component } from 'react';
import uuid from 'react-uuid';
import { AsyncPreviewFileUpload } from '../../../../../../components/FileUpload';
import './SingleQuestionOption.scss';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class SingleQuestionOption extends Component {
    state = {
        isAnswer: this.props.value.isAnswer ?? false,
        text: this.props.value.text ?? undefined,
        image: this.props.value.image ?? undefined,
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleCheckboxClick = (e) => {
        this.setState({
            [e.target.name]: !this.state[e.target.name],
        });
    };

    handleFileChange = (e, file) => {
        const input = e.target;

        this.setState(
            {
                [input.name]: file,
            },
            this.dispatchLessonChange
        );
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
            this.props.onChange(null, this.state);
        }
        if (JSON.stringify(prevProps) !== JSON.stringify(this.props)) {
            this.setState({
                isAnswer: this.props.value.isAnswer ?? false,
                text: this.props.value.text ?? undefined,
                image: this.props.value.image ?? undefined,
            });
        }
    }

    render() {
        const {
            state: { isAnswer, text, image },
            props: { hideImageOption },
        } = this;

        return (
            <div className='single-question-option'>
                <input type='checkbox' name='isAnswer' checked={isAnswer} onChange={this.handleCheckboxClick} />
                <TextInput type='text' name='text' value={text || ''} onChange={this.handleInputChange} />
                {!hideImageOption && (
                    <AsyncPreviewFileUpload
                        label='Option image'
                        type='image'
                        name='image'
                        id={`question-image-${uuid()}`}
                        file={image}
                        onChange={this.handleFileChange}
                    />
                )}
            </div>
        );
    }
}
