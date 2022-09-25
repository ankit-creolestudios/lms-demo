import React, { Component, ReactNode } from 'react';
import { Button, Modal, Row, Col, Container, Form } from 'react-bootstrap';
import { Api } from 'src/helpers/new';
import { Link } from 'src/components/Link';
import './CourseButton.scss';
import moment from 'moment';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { setState } from 'src/helpers/localStorage';
import { IUserCourse } from './CourseButton';
import ExtensionForm from './ExtensionForm';
import RepurchaseForm from './RepurchaseForm';

interface IProps extends RouteComponentProps {
    showResaleOffers: boolean;
    togglePreview: () => void;
    allCourses: IUserCourse[] | undefined;
    getExamStatus: (status: string) => 'Failed' | 'Complete' | 'Incomplete';
    userCourse: IUserCourse;
    packageId?: string;
}

interface IState {
    modalFormData: any;
}

class ERModal extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            modalFormData: {},
        };
    }

    componentDidUpdate = (prevProps: IProps, prevState: IState) => {
        if (prevProps.showResaleOffers !== this.props.showResaleOffers) {
            this.setState({
                modalFormData: {},
            });
        }
    };

    findRemainingDays = (date: Date) => {
        return Math.ceil(
            moment(date).diff(new Date(), 'minutes') < 1 ? 0 : moment(date).diff(new Date(), 'minutes') / 1440
        );
    };

    getPurchaseType = (courseData: IUserCourse) => {
        if (courseData.expiresAt && moment(courseData.expiresAt).diff(new Date(), 'minutes') < 1) {
            return 'expiry';
        } else if (
            courseData.certificateExpiresAt &&
            moment(courseData.certificateExpiresAt).diff(new Date(), 'minutes') < 1
        ) {
            return 'certificateExpiry';
        } else if (courseData.status && courseData.status === 'FAILED') {
            return 'fail';
        } else if (courseData.status && courseData.status === 'EXAM_PASSED') {
            return 'pass';
        } else {
            return '';
        }
    };

    handleChange = (e: any) => {
        const modalValues = JSON.parse(e.target.value);
        modalValues['userPackageId'] = this.props.userCourse.userPackageId;
        this.setState({
            modalFormData: {
                ...this.state.modalFormData,
                [e.target.name]: modalValues,
            },
        });
    };

    handleRadioReset = () => {
        this.setState({
            modalFormData: {},
        });
    };

    handleSubmit = () => {
        if (Object.keys(this.state.modalFormData).length > 0) {
            setState(
                'cartPackageId',
                this.props.userCourse.userPackage ? this.props.userCourse.userPackage.packageId : this.props.packageId
            );
            this.props.history.push(`/checkout`, {
                ...Object.values(this.state.modalFormData).filter(
                    (data: any) => data?.purchaseType !== 'no-repurchase'
                ),
            });
        }
    };

    checkDisabled = (courseData: IUserCourse, index: number) => {
        if (this.props.allCourses && index > 0) {
            const previousCourseId = this.props.allCourses?.[index - 1].courseId;
            return (
                courseData?.conditionStatement?.includes('PREVIOUS') && !this.state.modalFormData?.[previousCourseId]
            );
        }
    };

    render() {
        const mainCourses = this.props.allCourses ? this.props.allCourses : [this.props.userCourse];

        return (
            <Modal
                size='lg'
                show={this.props.showResaleOffers}
                className='resale-options'
                onHide={this.props.togglePreview}
            >
                <Modal.Header className='header'>
                    <Modal.Title className='title'>
                        <img className='logo-img' src='/logo.png' alt='RealEstateU logo' />
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='modal-content'>
                    <div className='modal-container'>
                        <header>Out of Time? We&apos;ve got you covered.</header>
                        <div className='modal-instruction'>
                            Don&apos;t let hiccup get in the way of your journey to attaining your real estate license!
                            We provide extension on the time you have to complete expired courses, at a cheaper rate
                            than simply repurchasing.Simply Choose the courses and additional time you required below.
                        </div>
                        <div className='modal-offer-container'>
                            {mainCourses?.map((courseData: IUserCourse, index: number) => (
                                <Row className='modal-offer-row' key={index}>
                                    <Col className='modal-offer-details'>
                                        <div className='course-title'>{courseData.title}</div>
                                        <ul className='course-detail-options'>
                                            <li className='course-detail-option'>
                                                {this.findRemainingDays(courseData.expiresAt)}{' '}
                                                {this.findRemainingDays(courseData.expiresAt) === 1 ? 'day' : 'days'}{' '}
                                                remaining
                                            </li>
                                            <li className='course-detail-option'>
                                                {courseData.attemptLimit
                                                    ? courseData.attemptLimit - courseData.examAttempts
                                                    : '-'}{' '}
                                                exam attempts remaining
                                            </li>
                                            <li className='course-detail-option'>
                                                Course {this.props.getExamStatus(courseData.status)}
                                            </li>
                                            <li className='course-detail-option'>
                                                {courseData?.extensionLimit &&
                                                typeof courseData.extensionLimitUsed === 'number'
                                                    ? courseData.extensionLimit - courseData.extensionLimitUsed
                                                    : 'Ꝏ'}{' '}
                                                extension remaining
                                            </li>
                                        </ul>
                                    </Col>
                                    {!!this.getPurchaseType(courseData) ? (
                                        //  @ts-ignore
                                        courseData.offerConditions?.[[this.getPurchaseType(courseData)]] ===
                                        'repurchase' ? (
                                            <RepurchaseForm
                                                courseData={courseData}
                                                index={index}
                                                checkDisabled={this.checkDisabled}
                                                handleChange={this.handleChange}
                                                modalFormData={this.state.modalFormData}
                                            />
                                        ) : //  @ts-ignore
                                        courseData.offerConditions?.[[this.getPurchaseType(courseData)]] ===
                                              'extension' &&
                                          (courseData.extensionLimit
                                              ? courseData.extensionLimit - courseData.extensionLimitUsed
                                              : 1000000 - courseData.extensionLimitUsed) > 0 ? (
                                            <ExtensionForm
                                                courseData={courseData}
                                                index={index}
                                                checkDisabled={this.checkDisabled}
                                                handleChange={this.handleChange}
                                                modalFormData={this.state.modalFormData}
                                            />
                                        ) : (
                                            <></>
                                        )
                                    ) : courseData.offerOptions &&
                                      courseData.offerOptions.extension.length > 0 &&
                                      (courseData.extensionLimit
                                          ? courseData.extensionLimit - courseData.extensionLimitUsed
                                          : 1000000 - courseData.extensionLimitUsed) > 0 ? (
                                        <ExtensionForm
                                            courseData={courseData}
                                            index={index}
                                            checkDisabled={this.checkDisabled}
                                            handleChange={this.handleChange}
                                            modalFormData={this.state.modalFormData}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </Row>
                            ))}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className='footer'>
                    <Button onClick={this.handleRadioReset}>Reset</Button>
                    <Button onClick={this.handleSubmit}>Continue</Button>
                    <Button onClick={this.props.togglePreview}>Cancel</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default withRouter(ERModal);
