import React, { Component } from 'react';
import './FillGap.scss';
import { QuestionContext } from './QuestionContext';

import FillGapQuestion from '../../../QuestionsModal/FillGapQuestion';

export default class FillGap extends Component {
    static contextType = QuestionContext;

    render() {
        const { questions, heading, subHeading, content, userAnswers } = this.context;

        return (
            <div className='lesson-cards__fillgap-type'>
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                {content && (
                    <div className='lesson-cards__fillgap-content' dangerouslySetInnerHTML={{ __html: content }} />
                )}
                <div className='lesson-cards__fillgap-questions'>
                    {questions.map(({ question, options }, index) => (
                        <FillGapQuestion
                            key={index}
                            title={question}
                            options={options.map((option) => option.text)}
                            answer={userAnswers?.[index]?.[0] ?? -1}
                            onAnswer={(res) => this.context.selectAnswer(index, null, res)}
                            prepend={<b key='prefix'>{index + 1}.</b>}
                        />
                    ))}
                </div>
            </div>
        );
    }
}

