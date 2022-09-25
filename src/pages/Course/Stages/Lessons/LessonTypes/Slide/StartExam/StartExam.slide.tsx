import React, { Component } from 'react';
import CourseContext from 'src/pages/Course/CourseContext';
import { ConditionalWrapper } from 'src/components/ConditionalWrapper/ConditialWrapper';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface IProps {
    clickHandler: () => void;
}
interface IState {}

export default class StartExamSlide extends Component<IProps, IState> {
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
                <div
                    className={`lesson-button ${!available ? ' lesson-button--disabled' : ''}`}
                    onClick={() => {
                        available ? this.props.clickHandler() : () => {};
                    }}
                >
                    <>Take Final Exam</>
                </div>
            </ConditionalWrapper>
        );
    }
}
