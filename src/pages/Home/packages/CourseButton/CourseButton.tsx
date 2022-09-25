import React, { Component, ReactNode } from 'react';
import { Button, Modal, Row, Col, Container, Form } from 'react-bootstrap';
import { Api } from 'src/helpers/new';
import { Link } from 'src/components/Link';
import './CourseButton.scss';
import moment from 'moment';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { setState } from 'src/helpers/localStorage';
import ERModal from './ERModal';
interface IProps extends RouteComponentProps {
    userCourse: IUserCourse;
    allCourses?: IUserCourse[];
    packageId?: string;
}

export interface IUserCourse {
    _id: string;
    userId: string;
    userPackageId: string;
    courseId: string;
    title: string;
    description: string;
    image: string;
    availability: number;
    status: string;
    conditionStatement: string;
    courseProgress: string;
    percentageProgress: number;
    inactiveTime: number;
    timerPause: boolean;
    totalLessonsTime: number;
    lessons: any[];
    lastChapterId: string;
    lastLessonId: string;
    lastPageIndex: number;
    editingAdmins: any[];
    enrollmentForm: any;
    enrollmentUpdatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    unlockedAt: Date;
    expiresAt: Date;
    preExamUpdatedAt?: Date;
    postExamUpdatedAt?: Date;
    suspendedAt?: Date;
    readyForExam?: boolean;
    extensionLimit: number;
    extensionLimitUsed: number;
    certificateData?: any[];
    offerConditions: IOfferConditions;
    offerOptions: IOfferOptions;
    certificateExpiresAt: Date;
    examAttempts: number;
    attemptLimit: number;
    repurchase: string;
    userPackage: any;
}

interface IOfferOptions {
    extension: [
        {
            _id: string;
            price: number;
            time: number;
        }
    ];
}
interface IOfferConditions {
    pass: string;
    fail: string;
    expiry: string;
    certificateExpiry: string;
}
interface IState {
    value: string;
    link: string;
    initialText: string;
    certificationBtnValue: string;
    isCertificateExpired: boolean;
    isExtensionAvailable: boolean;
    showResaleOffers: boolean;
    mostPriority: offerConditionType | '';
    isCourseFailed: boolean;
}

enum offerConfitionsEnum {
    PASS = 'pass',
    FAIL = 'fail',
    EXPIRY = 'expiry',
    CERTIFICATE_EXPIRY = 'certificateExpiry',
}

enum courseStatus {
    NEW = 'NEW',
    FAILED = 'FAILED',
    FINISHED = 'FINISHED',
    EXAM_PASSED = 'EXAM_PASSED',
    IN_EXAM = 'IN_EXAM',
}

type offerConditionType =
    | offerConfitionsEnum.PASS
    | offerConfitionsEnum.FAIL
    | offerConfitionsEnum.EXPIRY
    | offerConfitionsEnum.CERTIFICATE_EXPIRY;

class CourseButton extends Component<IProps, IState> {
    supportUrl = 'mailto:support@realestateu.com';

    state: IState = {
        value: '',
        link: '/',
        initialText: '',
        isCertificateExpired: false,
        isExtensionAvailable: false,
        certificationBtnValue: 'Certification Expired',
        showResaleOffers: false,
        mostPriority: '',
        isCourseFailed: false,
    };

    async componentDidMount(): Promise<void> {
        const { userCourse } = this.props;
        if (this.getExtensionDetails()) {
            return;
        }
        if (userCourse.suspendedAt) {
            this.setState({ value: 'Contact support', link: this.supportUrl });
            return;
        }
        if (userCourse.status == 'FAILED') {
            this.setState({
                isExtensionAvailable: true,
                value: 'Exam Failed',
                initialText: 'Exam Failed',
                mostPriority: offerConfitionsEnum.FAIL,
                isCourseFailed: true,
            });
            return;
        }
        const { success, response } = await Api.call('get', `/users/courses/${userCourse._id}/available`);
        let value = '',
            link = '/';

        if (success) {
            if (response.available) {
                if (!userCourse.enrollmentUpdatedAt) {
                    link = `/new/courses/${userCourse._id}/enrollment`;
                    value = 'Enroll';
                } else if (userCourse.postExamUpdatedAt) {
                    link = `/new/courses/${userCourse._id}`;
                    value = 'View Course';
                } else {
                    if (userCourse.status === 'FINISHED' && !userCourse.preExamUpdatedAt) {
                        link = `/new/courses/${userCourse._id}/preexam`;
                    } else if (userCourse.readyForExam) {
                        link = `/new/courses/${userCourse._id}/exam`;
                    } else if (userCourse.status === 'EXAM_PASSED' && !userCourse.postExamUpdatedAt) {
                        link = `/new/courses/${userCourse._id}/postexam`;
                    } else {
                        link = `/new/courses/${userCourse._id}`;
                    }
                    value = 'Resume';
                }
            } else {
                value = 'Course unavailable';
            }
            this.setState({ value, link });
        }
    }

    get isCourseExpired() {
        return (
            this.props.userCourse.expiresAt && moment(this.props.userCourse.expiresAt).diff(new Date(), 'minutes') < 1
        );
    }

    get certificateExpired() {
        return (
            this.props.userCourse.certificateExpiresAt &&
            moment(this.props.userCourse.certificateExpiresAt).diff(new Date(), 'days') < 1
        );
    }

    get isExamFailed() {
        return (
            this.props.userCourse.status &&
            this.props.userCourse.status === 'FAILED' &&
            this.props.userCourse.examAttempts === 0
        );
    }

    get isExamPassed() {
        return this.props.userCourse.status && this.props.userCourse.status === 'EXAM_PASSED';
    }

    getExtensionConfiguration = (type: offerConditionType) => {
        const { offerConditions } = this.props.userCourse;

        return offerConditions && (!offerConditions[type] || offerConditions[type] !== 'none')
            ? offerConditions[type]
            : '';
    };

    handleMouseOver = (currentText: string, newText: string, isCertificateExpiredBtn?: boolean) => {
        if (isCertificateExpiredBtn) {
            this.setState({
                initialText: currentText,
                certificationBtnValue: newText,
            });
            return;
        }
        this.setState({
            initialText: currentText,
            value: newText,
        });
    };
    handleMouseOut = (isCertificateExpiredBtn: boolean) => {
        if (isCertificateExpiredBtn) {
            this.setState({
                certificationBtnValue: this.state.initialText,
            });
            return;
        }
        this.setState({
            value: this.state.initialText,
        });
    };
    getExtensionDetails = () => {
        if (
            this.isCourseExpired
            // && this.getExtensionConfiguration(offerConfitionsEnum.EXPIRY)
        ) {
            this.setState({
                isExtensionAvailable: true,
                value: 'Expire',
                initialText: 'Expire',
                mostPriority: offerConfitionsEnum.EXPIRY,
            });
            return true;
        } else if (
            // this.getExtensionConfiguration(offerConfitionsEnum.CERTIFICATE_EXPIRY) &&
            this.certificateExpired
        ) {
            this.setState({
                isCertificateExpired: true,
                mostPriority: offerConfitionsEnum.CERTIFICATE_EXPIRY,
                value: 'Go to Course',
                initialText: 'Go to Course',
                link: `/new/courses/${this.props.userCourse._id}`,
            });
            return true;
        } else if (
            // this.getExtensionConfiguration(offerConfitionsEnum.FAIL) &&
            this.isExamFailed
        ) {
            this.setState({
                isExtensionAvailable: true,
                value: 'Exam Unsuccessful',
                initialText: 'Exam Unsuccessful',
                mostPriority: offerConfitionsEnum.FAIL,
            });
            return true;
        } else if (
            // this.getExtensionConfiguration(offerConfitionsEnum.PASS) &&
            this.isExamPassed
        ) {
            this.setState({
                isExtensionAvailable: true,
                value: 'Exam Passed',
                initialText: 'Exam Passed',
                mostPriority: offerConfitionsEnum.PASS,
            });
            return true;
        } else {
            return false;
        }
    };

    setExtension = (type: string, offerCondition: string) => {
        switch (offerCondition) {
            case 'extension':
                break;
            case 'repurchase':
                break;
            case 'extension-repurchase':
                break;
        }
    };

    handleClick = () => {};

    togglePreview = () => {
        this.setState({ showResaleOffers: !this.state.showResaleOffers });
    };

    getExamStatus = (status: string) => {
        if (status === courseStatus.FAILED) {
            return 'Failed';
        } else if (status === courseStatus.FINISHED) {
            return 'Complete';
        } else {
            return 'Incomplete';
        }
    };

    render(): ReactNode {
        const { value, link, isCertificateExpired, isExtensionAvailable, showResaleOffers, isCourseFailed } =
            this.state;
        const { userCourse, allCourses, packageId } = this.props;
        return (
            <>
                {isCertificateExpired && (
                    <Link
                        to={''}
                        className={`extension-course-button certificate-btn`}
                        onMouseOver={(event: any) => {
                            this.handleMouseOver(event.target.innerText, 'Renew', true);
                        }}
                        onMouseOut={() => {
                            this.handleMouseOut(true);
                        }}
                        onClick={() => {
                            this.state.mostPriority &&
                                this.getExtensionConfiguration(offerConfitionsEnum.CERTIFICATE_EXPIRY) &&
                                this.togglePreview();
                        }}
                    >
                        {this.state.certificationBtnValue}
                    </Link>
                )}
                <Link
                    to={link}
                    className={`${
                        this.state.isExtensionAvailable || isCourseFailed ? 'extension-course-button' : 'course-button'
                    }`}
                    onClick={() => {
                        !isCertificateExpired &&
                            this.state.mostPriority &&
                            this.getExtensionConfiguration(this.state.mostPriority) &&
                            this.togglePreview();
                    }}
                    onMouseOver={(event: any) => {
                        !isCertificateExpired &&
                            isExtensionAvailable &&
                            this.state.mostPriority &&
                            this.getExtensionConfiguration(this.state.mostPriority) &&
                            this.handleMouseOver(event.target.innerText, 'Renew', false);
                    }}
                    onMouseOut={() => {
                        !isCertificateExpired &&
                            isExtensionAvailable &&
                            this.state.mostPriority &&
                            this.getExtensionConfiguration(this.state.mostPriority) &&
                            this.handleMouseOut(false);
                    }}
                >
                    {value}
                </Link>
                {(isExtensionAvailable || isCertificateExpired) && (
                    <ERModal
                        showResaleOffers={showResaleOffers}
                        togglePreview={this.togglePreview}
                        allCourses={allCourses}
                        userCourse={userCourse}
                        getExamStatus={this.getExamStatus}
                        packageId={packageId}
                    />
                )}
            </>
        );
    }
}

export default withRouter(CourseButton);
