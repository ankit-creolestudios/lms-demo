import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper/ConditialWrapper';
import CourseContext from 'src/pages/Course/CourseContext';
import './StartExam.page.scss';

interface IProps {
    clickHandler: () => void;
}
interface IState {}

export default class StartExamPage extends Component<IProps, IState> {
    static contextType = CourseContext;

    render() {
        const {
            examStatus: { available, message },
        } = this.context;
        return (
            <ConditionalWrapper
                condition={!available}
                wrapper={(children: any) => (
                    <OverlayTrigger overlay={<Tooltip id={`tooltip-next-lesson`}>{message}</Tooltip>}>
                        {children}
                    </OverlayTrigger>
                )}
            >
                <button
                    onClick={() => {
                        available ? this.props.clickHandler() : () => {};
                    }}
                    className={`exam-button${!available ? ' exam-button-disabled' : ''}`}
                >
                    {' '}
                    Take Final Exam{' '}
                </button>
            </ConditionalWrapper>
        );
    }
}
