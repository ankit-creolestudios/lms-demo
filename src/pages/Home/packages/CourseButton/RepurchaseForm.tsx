import React, { Component } from 'react';
import { Form } from 'react-bootstrap';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { IUserCourse } from './CourseButton';

interface IProps extends RouteComponentProps {
    courseData: IUserCourse;
    index: number;
    checkDisabled: (courseData: IUserCourse, index: number) => boolean | undefined;
    handleChange: (e: any) => void;
    modalFormData: any;
}

class RepurchaseForm extends Component<IProps> {
    render() {
        const { courseData, index, checkDisabled, handleChange, modalFormData } = this.props;
        return (
            <Form className='model-offer-options' onChange={handleChange}>
                <Form.Check name={courseData.courseId} type={'radio'}>
                    <Form.Check.Input
                        name={courseData.courseId}
                        type={'radio'}
                        value={JSON.stringify({
                            _id: courseData.courseId,
                            purchaseType: 'no-repurchase',
                        })}
                        checked={
                            modalFormData?.[courseData.courseId] &&
                            modalFormData?.[courseData.courseId]?.purchaseType === 'no-repurchase'
                        }
                        disabled={checkDisabled(courseData, index)}
                    />
                    <Form.Check.Label>
                        No Repurchase <span>$0.00</span>
                    </Form.Check.Label>
                </Form.Check>
                <Form.Check name={courseData.courseId} type={'radio'}>
                    <Form.Check.Input
                        name={courseData.courseId}
                        type={'radio'}
                        value={JSON.stringify({
                            _id: courseData.courseId,
                            purchaseType: 'repurchase',
                        })}
                        checked={
                            modalFormData?.[courseData.courseId] &&
                            modalFormData?.[courseData.courseId]?.purchaseType === 'repurchase'
                        }
                        disabled={checkDisabled(courseData, index)}
                    />
                    <Form.Check.Label>
                        Repurchase Course <span>${parseFloat(courseData.repurchase).toFixed(2)}</span>
                    </Form.Check.Label>
                </Form.Check>
            </Form>
        );
    }
}

export default withRouter(RepurchaseForm);
