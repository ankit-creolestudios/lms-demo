import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router-dom';
import { Col, Form, FormGroup, Row } from 'react-bootstrap';

import apiCall from '../../../../../helpers/apiCall';
import apiFile from '../../../../../helpers/apiFile';

import ReactTooltip from 'react-tooltip';
import { BsInfoCircle } from 'react-icons/bs';

import { FileUpload } from '../../../../../components/FileUpload';
import { Spinner } from '../../../../../components/Spinner';
import { RouteLeavingGuard } from '../../../../../components/RouteLeavingGuard';
import CourseContent from './CourseContent';

class CourseForm extends Component {
    _isMounted = false;

    state = {
        loading: true,
        isDirty: false,
        redirect: null,

        course: {
            title: '',
            description: '',
            inactiveTime: '',
            outOfFocusPause: false,
            availability: '',
            imageFileId: '',
            imagePreviewUrl: '',
            imageFile: null,
        },
    };

    constructor(props) {
        super(props);

        this.docId = this.props.match.params.courseId;
    }

    doRedirect = (courseId, message) => {
        this.toggleSpinner();

        this.props.setGlobalAlert({
            type: 'success',
            message: message ?? `Course has been ${this.docId !== 'new' ? 'updated' : 'created'}`,
        });

        if (this.docId === 'new') {
            this.setState({
                redirect: `/admin/courses/${courseId}`,
            });
        }
    };

    getPayload = () => {
        return {
            title: this.state.course.title,
            description: this.state.course.description,
            image: this.state.course.imageFileId,
            outOfFocusPause: this.state.course.outOfFocusPause,
            inactiveTime: this.state.course.inactiveTime * 60,
            availability: this.state.course.availability,
            conditionStatement: this.state.course.conditionStatement,
            lessonType: this.state.course.lessonType,
        };
    };

    setIsDirty = (dirty) => {
        this.setState({
            isDirty: dirty,
        });
    };

    handleChange = (event) => {
        const value =
            parseInt(event.target.value).toString() === 'NaN'
                ? !!event.target.value
                    ? event.target.value
                    : ''
                : Math.max(0, Math.min(9999999999, Number(event.target.value)));
        this.setState({
            isDirty: true,
            course: {
                ...this.state.course,
                [event.target.name]: value,
            },
        });
    };

    handleImageChange = (type, image, imageFile) => {
        this.setState({
            isDirty: true,
            course: {
                ...this.state.course,
                imagePreviewUrl: image,
                imageFile,
            },
        });
    };

    handleSubmit = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setIsDirty(false);
        this.toggleSpinner();
        await this.submit();
    };

    handleSubmitFailed = (message) => {
        this.props.setGlobalAlert({
            type: 'error',
            message: message ?? 'There was a problem with saving this Course. Please try again',
        });
        this.toggleSpinner();
    };

    toggleSpinner = (show) => {
        this.setState({
            loading: !this.state.loading,
        });
    };

    submit = async () => {
        if (this.state.course.imageFile) {
            let imagePostData = new FormData();
            imagePostData.append('file', this.state.course.imageFile);
            const { success, response } = await apiCall('POST', '/files', imagePostData);
            if (success && this._isMounted) {
                this.setState({
                    course: {
                        ...this.state.course,
                        imageFileId: response.fileId,
                        imagePreviewUrl: await apiFile(response.fileId),
                        imageFile: null,
                    },
                });
            }
        }

        if (!this._isMounted) {
            return;
        }

        let submitMethod = 'POST';
        let submitUrl = '/courses';

        if (this.docId !== 'new') {
            submitMethod = 'PUT';
            submitUrl = `/courses/${this.docId}`;
        }

        const { success, response, message } = await apiCall(submitMethod, submitUrl, this.getPayload());

        if (this._isMounted) {
            if (success && response) {
                this.doRedirect(response._id, message);
            } else {
                this.handleSubmitFailed(message);
            }
        }
    };

    createButtons = () => {
        let customButtons = [
            {
                label: 'Save',
                onClick: this.handleSubmit,
                className: 'bp',
                disabled: !this.state.isDirty,
            },
            {
                label: 'Publish',
                // onClick: this.publish,
                disabled: true,
            },
        ];

        if (this.state?.lesson?.previousLesson) {
            customButtons.push({
                label: 'Previous',
                className: 'lesson-navigation-btn',
                icon: faChevronLeft,
                link: `/admin/courses/${this.props.match.params.courseId}/chapters/${this.state.lesson.previousLesson.chapterId}/ext/lessons/edit/${this.state.lesson.previousLesson._id}`,
            });
        }

        if (this.state?.lesson?.nextLesson) {
            customButtons.push({
                label: 'Next',
                className: 'lesson-navigation-btn',
                icon: faChevronRight,
                link: `/admin/courses/${this.props.match.params.courseId}/chapters/${this.state.lesson.nextLesson.chapterId}/ext/lessons/edit/${this.state.lesson.nextLesson._id}`,
            });
        }

        this.props.createFormActions({
            customButtons,
        });
    };

    componentDidMount = async () => {
        this._isMounted = true;
        if (this.docId !== 'new') {
            await this.loadData();
        }
        this.createButtons();
    };

    componentWillUnmount = () => {
        this._isMounted = false;

        window.socket.emit('remove user editing course', this.docId);
        this.props.createFormActions({});
    };

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.isDirty !== prevState.isDirty) {
            this.createButtons();
        }

        if (prevProps.match.params.courseId !== this.props.match.params.courseId) {
            this.docId = this.props.match.params.courseId;
            await this.loadData();
        }
        if (this.props.formActions.state && this.props.formActions.state.reload) {
            if (this.props.formActions.state.cancel) {
                this.props.history.push('/admin/courses');
            }
            this.props.createFormActions({
                ...this.props.formActions.state,
                reload: false,
            });
            await this.loadData();
        }
    }

    loadData = async () => {
        if (this.docId && this.docId !== 'new') {
            this.setState({
                loading: true,
            });
            const { success, response } = await apiCall('GET', `/courses/${this.docId}`);
            if (success && this._isMounted) {
                this.setState({
                    loading: false,
                    redirect: null,
                    course: {
                        ...response,
                        imagePreviewUrl: await apiFile(response.image),
                        availability: response.availability,
                        inactiveTime: response.inactiveTime / 60,
                    },
                });
            }
        } else {
            this.setState({
                loading: false,
            });
        }
    };

    onKeyPress = (event) => {
        if (event.charCode === 13 && event.target.nodeName !== 'TEXTAREA') {
            event.preventDefault();
            const allowedTags = ['TEXTAREA', 'INPUT', 'SELECT'];
            const form = document.getElementById('form');
            if (form) {
                const allowedElems = Array.from(form.elements).filter((elem) => {
                    return allowedTags.indexOf(elem.tagName) >= 0;
                });

                const index = allowedElems.indexOf(event.target);
                allowedElems[(index + 1) % allowedElems.length].focus();
            }
        }
    };

    getEditingText(editingAdmins) {
        let alreadyProceedUsersIds = [];

        const reducedArray = editingAdmins.reduce((arr, { _id, firstName, lastName }) => {
            if (_id && _id !== this.props.loggedIn.user._id) {
                if (!alreadyProceedUsersIds.includes(_id)) {
                    alreadyProceedUsersIds.push(_id);
                    arr.push(`<b>${firstName} ${lastName}</b>`);
                }
            }

            return arr;
        }, []);

        if (reducedArray.length) {
            return (
                <div className='pt-4'>
                    <span
                        className='message-alert warning narrow'
                        dangerouslySetInnerHTML={{
                            __html: `${reducedArray.join(', ')}
                                  ${reducedArray.length > 1 ? ' are' : ' is '}
                                 also editing this course`,
                        }}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    render() {
        let mainContent;

        if (this.state.redirect) {
            mainContent = <Redirect to={this.state.redirect} />;
        } else if (this.state.loading && this.docId !== 'new') {
            mainContent = <Spinner />;
        } else {
            const { course } = this.state;
            mainContent = (
                <>
                    {Array.isArray(course.editingAdmins) &&
                        course.editingAdmins.length > 1 &&
                        this.getEditingText(course.editingAdmins)}
                    <Form onSubmit={this.handleSubmit} id='courseForm' onKeyPress={this.onKeyPress}>
                        <Row className='pt-5'>
                            <Col lg={7}>
                                <Row>
                                    <Col lg={8}>
                                        <Row>
                                            <Col>
                                                <FormGroup>
                                                    <Form.Label htmlFor='title'>Course Name</Form.Label>
                                                    <Form.Control
                                                        type='text'
                                                        required
                                                        minLength='3'
                                                        maxLength='512'
                                                        id='title'
                                                        name='title'
                                                        value={course.title}
                                                        onChange={this.handleChange}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row className='pt-4'>
                                            <Col xs={12} md={6}>
                                                <FormGroup>
                                                    <Form.Label htmlFor='inactiveTime'>Inactive Time (mins)</Form.Label>
                                                    <Form.Control
                                                        type='number'
                                                        min={0}
                                                        id='inactiveTime'
                                                        name='inactiveTime'
                                                        value={
                                                            typeof course.inactiveTime !== 'undefined'
                                                                ? parseInt(course.inactiveTime)
                                                                : ''
                                                        }
                                                        onChange={this.handleChange}
                                                    />
                                                </FormGroup>
                                            </Col>
                                            <Col xs={12} md={6}>
                                                <FormGroup>
                                                    <Form.Label htmlFor='outOfFocusPause'>
                                                        <ReactTooltip effect='solid' multiline={true} />
                                                        Pause on non focus&nbsp;
                                                        <BsInfoCircle data-tip='When enabled, the timer will pause and a popup will appear <br/> when the student navigates away from the lessons tab.' />
                                                    </Form.Label>
                                                    <Form.Control
                                                        as='select'
                                                        required
                                                        id='outOfFocusPause'
                                                        name='outOfFocusPause'
                                                        value={course.outOfFocusPause}
                                                        onChange={this.handleChange}
                                                    >
                                                        <option disabled value=''></option>
                                                        <option value='true'>Yes</option>
                                                        <option value='false'>No</option>
                                                    </Form.Control>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                        <Row className='pt-4'>
                                            <Col xs={12} md={6}>
                                                <FormGroup>
                                                    <Form.Label htmlFor='lessonType'>Lesson Type</Form.Label>
                                                    <Form.Control
                                                        as='select'
                                                        id='lessonType'
                                                        name='lessonType'
                                                        required
                                                        value={course.lessonType}
                                                        onChange={this.handleChange}
                                                    >
                                                        <option value='page'>Page</option>
                                                        <option value='slide'>Slide</option>
                                                    </Form.Control>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={4}>
                                        <Row>
                                            <Col xs={12}>
                                                <FormGroup>
                                                    <Form.Label htmlFor='availability'>Availability (days)</Form.Label>
                                                    <Form.Control
                                                        id='availability'
                                                        name='availability'
                                                        type='number'
                                                        min={0}
                                                        step={1}
                                                        value={
                                                            typeof course.availability !== 'undefined'
                                                                ? parseInt(course.availability)
                                                                : ''
                                                        }
                                                        onChange={this.handleChange}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                            <Col lg={5}>
                                <Row>
                                    <Col lg={6}>
                                        <Row>
                                            <Col>
                                                <FormGroup>
                                                    <Form.Label htmlFor='description'>Description</Form.Label>
                                                    <Form.Control
                                                        as='textarea'
                                                        type='text'
                                                        required
                                                        rows='6'
                                                        id='description'
                                                        name='description'
                                                        value={course.description}
                                                        onChange={this.handleChange}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={6}>
                                        <Row>
                                            <Col>
                                                <FormGroup>
                                                    <FileUpload
                                                        id='image'
                                                        name='image'
                                                        url={course.imagePreviewUrl}
                                                        handleFileChange={this.handleImageChange}
                                                        type='image'
                                                        required={course.imagePreviewUrl}
                                                    />
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                    {this.docId !== 'new' && (
                        <Row className='pt-0'>
                            <Col>
                                {' '}
                                <CourseContent courseId={this.docId} />
                            </Col>
                        </Row>
                    )}
                </>
            );
        }
        return (
            <div>
                <RouteLeavingGuard
                    when={this.state.isDirty}
                    navigate={(path) => this.props.history.push(path)}
                    shouldBlockNavigation={() => {
                        return this.state.isDirty;
                    }}
                />
                <main>{mainContent}</main>
            </div>
        );
    }
}

export default connect(
    (state) => {
        return {
            formActions: state.formActions,
            loggedIn: state.loggedIn,
        };
    },
    {
        pushBreadcrumbLink: (payload) => ({
            type: 'PUSH_BREADCRUMB_LINK',
            payload,
        }),
        removeBreadcrumbLink: (payload) => ({
            type: 'REMOVE_BREADCRUMB_LINK',
            payload,
        }),
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
        createFormActions: (payload) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
    }
)(withRouter(CourseForm));
