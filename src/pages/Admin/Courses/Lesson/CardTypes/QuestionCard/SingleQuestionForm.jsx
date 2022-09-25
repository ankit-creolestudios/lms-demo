import React, { Component } from 'react';
import InputStack from '../../../../../../components/InputStack/InputStack';
import SingleQuestionOption from './SingleQuestionOption';
import TextInput from '../../../../../../components/inputs/TextInput';

export default class SingleQuestionForm extends Component {
    state = {
        question: this.props?.value?.question ?? '',
        options: Array.isArray(this.props?.value?.options)
            ? this.props.value.options.map((option, index) => ({
                  ...option,
                  isAnswer: this.props.value.answer.includes(index),
              }))
            : [],
    };

    emptyOption = {
        isAnswer: false,
        text: '',
        image: undefined,
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    };

    handleOptionsChange = (options) => {
        this.setState({
            options,
        });
    };

    componentDidUpdate(prevProps, prevState) {
        if (JSON.stringify(prevProps.value) !== JSON.stringify(this.props.value)) {
            this.setState({
                question: this.props.value.question ?? '',
                options: Array.isArray(this.props.value.options)
                    ? this.props.value.options.map((option, index) => ({
                          ...option,
                          isAnswer: this.props.value.answer.includes(index),
                      }))
                    : [],
            });
        } else if (JSON.stringify(prevState) !== JSON.stringify(this.state)) {
            let { question, options } = this.state,
                answer = [];

            options = options.map((option, index) => {
                const { text, image, isAnswer } = option;

                if (isAnswer) {
                    answer.push(index);
                }

                return {
                    text,
                    image,
                };
            });

            this.props.onChange(null, { question, options, answer });
        }
    }

    render() {
        const {
            state: { question },
            props: { index, hideImageOption },
        } = this;

        let options = Array.isArray(this.props?.value?.options)
            ? this.props.value.options.map((option, index) => ({
                  ...option,
                  isAnswer: this.props.value.answer.includes(index),
              }))
            : [];

        return (
            <div className='question-form'>
                <label htmlFor={`question-${index}`}>Question #{index}</label>
                <TextInput
                    type='text'
                    name='question'
                    id={`question-${index}`}
                    onChange={this.handleInputChange}
                    value={question}
                />
                <div className='question-form__options'>
                    <b>Options</b>
                    <InputStack
                        value={options}
                        onChange={this.handleOptionsChange}
                        emptyValue={this.emptyOption}
                        component={SingleQuestionOption}
                        hideImageOption={hideImageOption}
                    />
                </div>
            </div>
        );
    }
}
