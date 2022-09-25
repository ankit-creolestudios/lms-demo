import React, { Component } from 'react';
import './FillGap.scss';
import { QuestionContext } from '../../QuestionContext';

import FillGapQuestion from '../../QuestionsModal/FillGapQuestion';

interface IProps {}
export default class FillGap extends Component<IProps> {
    static contextType = QuestionContext;

    render() {
        const { questions, heading, subHeading, content, userAnswers } = this.context;

        return (
            <>
                <header>
                    {heading && <h1>{heading}</h1>}
                    {subHeading && <h3>{subHeading}</h3>}
                </header>
                <div className='fillgap-container'>
                    {content && <div className='fillgap-content' dangerouslySetInnerHTML={{ __html: content }} />}
                    <div className='fillgap-questions'>
                        {questions.map(({ question, options }: any, index: number) => (
                            <FillGapQuestion
                                key={index}
                                title={question}
                                options={options.map((option: any) => option.text)}
                                answer={userAnswers?.[index]?.[0] ?? -1}
                                onAnswer={(res) => this.context.selectAnswer(index, null, res)}
                                prepend={<b key='prefix'>{index + 1}.</b>}
                            />
                        ))}
                    </div>
                </div>
            </>
        );
    }
}
