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

class ExtensionForm extends Component<IProps> {
    render() {
        const { courseData, index, checkDisabled, handleChange, modalFormData } = this.props;
        return (
            <Form className='model-offer-options' onChange={handleChange}>
                {courseData?.offerOptions?.extension.map((extDetail, i) => (
                    <Form.Check name={courseData.courseId} type={'radio'} key={`extension-${i}`}>
                        <Form.Check.Input
                            name={courseData.courseId}
                            type={'radio'}
                            value={JSON.stringify({
                                _id: courseData.courseId,
                                extensionId: extDetail._id,
                                purchaseType: 'extension',
                            })}
                            disabled={checkDisabled(courseData, index)}
                            checked={
                                modalFormData?.[courseData.courseId] &&
                                modalFormData?.[courseData.courseId]?.extensionId === extDetail._id
                            }
                        />
                        <Form.Check.Label>
                            {extDetail.time} days <span>${extDetail.price.toFixed(2)}</span>
                        </Form.Check.Label>
                    </Form.Check>
                ))}
            </Form>
        );
    }
}

export default withRouter(ExtensionForm);
