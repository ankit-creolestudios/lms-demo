import React, { Component, ReactElement } from 'react';
import './FillGapQuestion.scss';

interface IProps {
    title: string;
    options: any;
    answer: string;
    prepend: ReactElement<any, any>;
    onAnswer: (i: string) => 1;
}
export default class FillGapQuestion extends Component<IProps> {
    render() {
        const { title, options, answer, prepend, onAnswer } = this.props,
            components = title.split('___').reduce((arr: any, el, index) => {
                if (index === 0 && prepend) {
                    arr.push(prepend);
                }

                arr.push(<React.Fragment key={`question-part-${index}`}> {el}</React.Fragment>);

                if (index === 0) {
                    arr.push(
                        <select
                            key={'question-select'}
                            value={answer}
                            onChange={
                                onAnswer
                                    ? (e) => {
                                          onAnswer(e.target.value);
                                      }
                                    : () => {}
                            }
                        >
                            <option value={-1}></option>
                            {options.map((option: any, index: number) => (
                                <option key={index} value={index}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    );
                }

                return arr;
            }, []);

        return <div className='fillGapQuestion'>{components}</div>;
    }
}
