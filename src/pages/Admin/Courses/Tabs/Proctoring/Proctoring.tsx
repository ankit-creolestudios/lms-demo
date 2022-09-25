import React, { Component } from 'react';
import { Form, Col, Row, FormGroup } from 'react-bootstrap';
import { Api, EventBus } from 'src/helpers/new';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import LessonProctoringInputs from './LessonProctoringInputs';
import { Spinner } from 'src/components/Spinner';

interface IRouteProps {
    courseId: string;
}

interface IConnectProps {
    createFormActions: (payload: any) => void;
}

interface IState {
    isLoading: boolean;
    isEdited: boolean;
    enrollment?: string;
    preExam?: string;
    postExam?: string;
    needsAuth: string[];
}

class Proctoring extends Component<IConnectProps & RouteComponentProps<IRouteProps>, IState> {
    state: IState = {
        isLoading: true,
        isEdited: false,
        enrollment: 'biosig',
        preExam: 'biosig',
        postExam: 'biosig',
        needsAuth: [],
    };

    componentDidMount() {
        this.fetchCourseData();
        this.setButtons();
    }

    componentWillUnmount() {
        this.props.createFormActions({
            customButtons: [],
        });
    }

    fetchCourseData = async (): Promise<void> => {
        if (!this.state.isLoading) {
            this.setState({ isLoading: true });
        }
        const { success, response } = await Api.call('get', `courses/${this.props.match.params.courseId}`);

        if (success && response.proctoringSettings) {
            const { needsAuth, enrollment, preExam, postExam } = response.proctoringSettings;
            this.setState({
                isLoading: false,
                needsAuth,
                enrollment,
                preExam,
                postExam,
            });
        } else {
            this.setState({
                isLoading: false,
            });
        }
    };

    setButtons = () => {
        this.props.createFormActions({
            customButtons: [
                {
                    label: 'Save',
                    onClick: this.handleSubmit,
                    className: 'bp',
                    disabled: !this.state.isEdited,
                },
            ],
        });
    };

    handleChange = ({ currentTarget }: any) => {
        type stages = 'enrollment' | 'preExam' | 'postExam';
        const { name } = currentTarget;
        let { value } = currentTarget;
        if (value === 'none') value = null;
        //@ts-ignore
        this.setState({ [name as stages]: value as string, isEdited: true }, () => {
            this.setButtons();
        });
    };

    handleCheckpointChange = (checkpoints: string[]) => {
        this.setState({ needsAuth: checkpoints, isEdited: true }, () => {
            this.setButtons();
        });
    };

    handleSubmit = (e: React.FormEvent): void => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        this.save();
    };

    save = async () => {
        const { isLoading, isEdited, ...submitData } = this.state;
        const { success, response, message } = await Api.call(
            'patch',
            `courses/proctoring/${this.props.match.params.courseId}`,
            submitData
        );

        if (success) {
            EventBus.dispatch('toast', {
                type: 'success',
                message,
            });
            this.setState({ isEdited: false }, () => {
                this.setButtons();
            });
        }
    };

    render() {
        if (this.state.isLoading) return <Spinner />;
        const { enrollment, preExam, postExam, needsAuth } = this.state;

        return (
            <div>
                <Form id='proctoring-form'>
                    <Row className='pt-4'>
                        <Col lg={2}>
                            <FormGroup>
                                <Form.Label htmlFor='enrollment'>Enrollment</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='enrollment'
                                    name='enrollment'
                                    value={enrollment ?? 'none'}
                                    onChange={this.handleChange}
                                >
                                    <option value='none'>None</option>
                                    <option value='biosig'>BioSig</option>
                                </Form.Control>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup>
                                <Form.Label htmlFor='preExam'>Pre-Exam</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='preExam'
                                    name='preExam'
                                    value={preExam ?? 'none'}
                                    onChange={this.handleChange}
                                >
                                    <option value='none'>None</option>
                                    <option value='biosig'>BioSig</option>
                                </Form.Control>
                            </FormGroup>
                        </Col>
                        <Col lg={2}>
                            <FormGroup>
                                <Form.Label htmlFor='postExam'>Post-Exam</Form.Label>
                                <Form.Control
                                    as='select'
                                    id='postExam'
                                    name='postExam'
                                    value={postExam ?? 'none'}
                                    onChange={this.handleChange}
                                >
                                    <option value='none'>None</option>
                                    <option value='biosig'>BioSig</option>
                                </Form.Control>
                            </FormGroup>
                        </Col>
                    </Row>
                </Form>
                <LessonProctoringInputs
                    checkpoints={needsAuth}
                    onChange={this.handleCheckpointChange}
                    courseId={this.props.match.params.courseId}
                />
            </div>
        );
    }
}

export default connect(null, {
    createFormActions: (payload: any) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
})(withRouter(Proctoring));
