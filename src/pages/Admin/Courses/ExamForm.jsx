import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Col, Form, FormGroup, Row } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ExamQuestion from './ExamQuestion';
import apiCall from '../../../helpers/apiCall';
import uuid from 'react-uuid';
import * as XLSX from 'xlsx';
import { RouteLeavingGuard } from '../../../components/RouteLeavingGuard';
import { Spinner } from '../../../components/Spinner';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import './ExamForm.scss';
import mergeRefs from '../../../helpers/mergeRefs';
import AdminLessonContext from './Lesson/AdminLessonContext';

class ExamForm extends Component {
    static contextType = AdminLessonContext;

    _isMounted = false;

    lastQuestionRef = React.createRef();

    constructor(props) {
        super(props);
        this.type = this.props.type === 'Quiz' ? 'Quiz' : 'Exam';

        this.state = {
            exam: this.props.quiz
                ? this.props.quiz
                : {
                      title: '',
                      passPct: '',
                      timeLimit: '',
                      timeoutAction: 'submit',
                      allowSkip: true,
                      randomize: true,
                      isFinal: true,
                      blocksFutureLessons: true,
                      questionSubsetCount: '',
                      revealAnswers: 'never',
                      allowReattempt: 'never',
                      marksIfCorrect: '',
                      marksIfWrong: '',
                      marksIfSkipped: '',
                      notifyStudent: 'never',
                      notifyAcademy: 'never',
                      questions: [],
                  },
            loading: false,
            redirect: null,
            isDirty: false,
            modalShow: false,
            course: {},
            errorMessage: null,
        };
    }

    createExamBreadcrumb = () => {
        const typePlural = this.type === 'Quiz' ? 'quizzes' : 'exams';
        const typeTitle = this.type.toUpperCase()[0] + this.type.substr(1).toLowerCase();
        if (this.type !== 'Quiz') {
            this.props.pushBreadcrumbLink({
                text: `${typeTitle}: ${this.state.exam.title}`,
                path: `/admin/courses/ext/${typePlural}/edit/${this.props.match.params.courseId}`,
            });
        }
    };

    removeExamBreadcrumbs = () => {
        const typePlural = this.type === 'Quiz' ? 'quizzes' : 'exams';
        const typeTitle = this.type.toUpperCase()[0] + this.type.substr(1).toLowerCase();
        if (this.type !== 'Quiz') {
            this.props.removeBreadcrumbLink({
                text: `${typeTitle}: ${this.state.exam.title}`,
                path: `/admin/courses/ext/${typePlural}/edit/${this.props.match.params.courseId}`,
            });
        }
    };

    createBreadcrumbs = () => {
        if (this.type !== 'Quiz') {
            this.props.pushBreadcrumbLink({
                text: 'Courses',
                path: '/admin/courses',
            });

            if (this.state.course._id) {
                this.props.pushBreadcrumbLink({
                    text: `Course: ${this.state.course.title}`,
                    path: `/admin/courses/${this.state.course._id}`,
                });
            }
            if (this.state.exam._id) {
                this.createExamBreadcrumb();
            }
        }
    };

    removeBreadcrumbs = () => {
        if (this.type !== 'Quiz') {
            this.props.removeBreadcrumbLink({
                text: 'Courses',
                path: '/admin/courses',
            });

            if (this.state.course._id) {
                this.props.removeBreadcrumbLink({
                    text: `Course: ${this.state.course.title}`,
                    path: `/admin/courses/${this.state.course._id}`,
                });
            }
            if (this.state.exam._id) {
                this.removeExamBreadcrumbs();
            }
        }
    };

    componentDidMount = async () => {
        this._isMounted = true;

        let newState = { loading: false };
        let course = {};

        if (this.props.match.params.parentId) {
            course = (await apiCall('GET', `/courses/${this.props.match.params.parentId}`)).response;
        }

        if (this.props.match.params.courseId || this.props.match.params.lessonId) {
            this.setState({ loading: true });

            const quizCard = this.context.quizCards && this.context.quizCards.find((card) => card?._id === this.props.cardId);

            if (!quizCard?.quiz) {
                const url =
                    this.type === 'Quiz'
                        ? `/${this.props.match.params.coreId ? 'core' : 'courses'}/quiz/${this.props.cardId}`
                        : `/courses/exams/${this.props.match.params.courseId}`;
                const { success, response } = await apiCall('GET', url);
                if (success && response && this._isMounted) {
                    if (this.type !== 'Quiz' && !course._id) {
                        course = (await apiCall('GET', `/courses/${response.parentId}`)).response;
                    }

                    newState = {
                        ...newState,
                        exam: {
                            ...response,
                            questions: (response.questions || []).map((question) => {
                                return {
                                    ...question,
                                    uuid: uuid(),
                                };
                            }),
                        },
                    };
                }
            } else {
                newState = { ...newState, exam: { ...this.state.exam, ...quizCard?.quiz } };
            }
        }

        newState.course = course;
        this.setState(newState);

        if (this.type !== 'Quiz') {
            this.props.createFormActions({
                save: true,
                cancel: true,
                cancelAction: 'return',
                returnPath: '/admin/courses',
                id: 'examForm',
            });

            this.createBreadcrumbs();
        }
    };

    componentDidUpdate() {
        if (this.props.formActions.state && this.props.formActions.state.reload) {
            if (this.props.handleQuizChange) {
                this.props.hideQuizModal();
            } else {
                this.props.history.push('/admin/courses');
            }
        }
        if (this.props.formActions.state && this.props.formActions.state.save) {
            if (this.type !== 'Quiz' && this.props.handleQuizChange) {
                this.props.handleQuizChange(this.state.exam);
                this.props.hideQuizModal();
            }
        }
    }

    componentWillUnmount = () => {
        this._isMounted = false;

        if (this.type !== 'Quiz') {
            this.removeBreadcrumbs();
            this.props.createFormActions({});
        }
    };

    handleChange = (event) => {
        this.setState({
            exam: {
                ...this.state.exam,
                [event.target.name]: event.target.value,
            },
            isDirty: true,
        });
    };

    handleQuestionChange = (questionIdx, prop, val) => {
        let newQuestions = [...this.state.exam.questions];
        newQuestions[questionIdx][prop] = val;
        this.setState({
            exam: {
                ...this.state.exam,
                questions: newQuestions,
            },
            isDirty: true,
        });
    };

    shiftQuestionOptions = (exam) => {
        return {
            ...exam,
            questions: exam.questions.map((question) => {
                let filteredOut = [];

                return {
                    ...question,
                    options: question.options.filter((option, i) => {
                        if (!option) {
                            filteredOut.push(i);
                        }
                        return option;
                    }),
                    correctOptionIdx:
                        question.correctOptionIdx -
                        filteredOut.filter((filteredOutIdx) => filteredOutIdx < question.correctOptionIdx).length,
                };
            }),
        };
    };

    handleSubmit = async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        this.setState({
            loading: true,
        });

        let exam = this.shiftQuestionOptions(this.state.exam);

        delete exam._id;
        delete exam.updatedAt;
        delete exam.createdAt;
        delete exam.__v;
        delete exam.chapter;

        if (this.type === 'Quiz') {
            await this.handleQuizSubmit();
        } else {
            let submitMethod = 'POST',
                submitUrl = '/courses/exams';

            if (this.props.match.params.courseId) {
                submitMethod = 'PUT';
                submitUrl += `/${this.state.exam._id}`;
            } else {
                exam.parentId = this.props.match.params.parentId;
            }

            const { success, response, message } = await apiCall(submitMethod, submitUrl, exam);

            if (this._isMounted) {
                this.setState({
                    loading: false,
                });

                if (success) {
                    this.props.setGlobalAlert({
                        type: 'success',
                        message: message ?? `${this.type} has been ${this.props.match.params.courseId ? 'updated' : 'created'}`,
                    });
                    this.setState({
                        isDirty: false,
                    });

                    if (submitMethod == 'POST') {
                        this.doRedirect(response.data._id);
                    } else {
                        this.removeExamBreadcrumbs();
                        this.createExamBreadcrumb();
                    }
                } else {
                    this.props.setGlobalAlert({
                        type: 'error',
                        message: message ?? `There was a problem with saving this ${this.type}. Please try again`,
                    });
                }
            }
        }
    };

    handleQuizSubmit = async () => {
        this.context.handleAddQuizToCard(this.props.cardId, this.state.exam);

        this.setState({
            loading: false,
        });

        this.props.hideQuizModal();
    };

    // load the file, read the data, parse data into json
    handleUpload = (event) => {
        event.preventDefault();

        let file = event.target.files[0];
        let reader = new FileReader();
        const self = this;

        reader.onload = function (e) {
            var data = e.target.result;
            let readData = XLSX.read(data, { type: 'binary' });

            const sheetConfig = readData.Sheets['Config'];
            const sheetQuestions = readData.Sheets['Questions'];

            /* Convert array to json */
            const configJson = XLSX.utils.sheet_to_json(sheetConfig, {
                header: 1,
            });
            const questionsJson = XLSX.utils.sheet_to_json(sheetQuestions, {
                header: 1,
            });

            self.populateExamFromJson(configJson, questionsJson);
        };

        if (file) {
            this.setState({ loading: true });
            reader.readAsBinaryString(file);
        }
    };

    populateExamFromJson = (config, questions) => {
        let errors = [];

        const processYesNo = (value) => {
            if (value.toLowerCase() === 'yes') {
                return 'true';
            } else if (value.toLowerCase() === 'no') {
                return 'false';
            } else {
                return '';
            }
        };

        const processPercent = (value) => {
            return value * 100;
        };

        const processEnum1 = (value) => {
            let allowedValues = ['never', 'always', 'on_pass'];
            value = value.toLowerCase();
            if (allowedValues.indexOf(value) < 0) {
                value = '';
            }
            return value;
        };

        const processEnum2 = (value) => {
            let allowedValues = ['never', 'always', 'on_fail'];
            value = value.toLowerCase();
            if (allowedValues.indexOf(value) < 0) {
                value = '';
            }
            return value;
        };

        const processEnum3 = (value) => {
            let allowedValues = ['submit', 'cancel'];
            value = value.toLowerCase();
            if (allowedValues.indexOf(value) < 0) {
                value = '';
            }
            return value;
        };

        const configMap = {
            TITLE: ['title', null],
            MARKS_PER_CORRECT_ANSWER: ['marksIfCorrect', null],
            MARKS_PER_WRONG_ANSWER: ['marksIfWrong', null],
            MARKS_PER_SKIPPED_ANSWER: ['marksIfSkipped', null],
            PASS_PERCENTAGE: ['passPct', processPercent],
            ALLOW_SKIP: ['allowSkip', processYesNo],
            BLOCKS_FUTURE_LESSONS: ['blocksFutureLessons', processYesNo],
            RANDOMIZE: ['randomize', processYesNo],
            QUESTION_SUBSET_COUNT: ['questionSubsetCount', null],
            NOTIFY_STUDENT: ['notifyStudent', processEnum1],
            NOTIFY_ACADEMY: ['notifyAcademy', processEnum1],
            TIME_LIMIT_MINUTES: ['timeLimit', null],
            TIMEOUT_ACTION: ['timeoutAction', processEnum3],
            REVEAL_ANSWERS: ['revealAnswers', processEnum1],
            ALLOW_REATTEMPT: ['allowReattempt', processEnum2],
            IS_FINAL: ['isFinal', processYesNo],
        };

        let exam = { ...this.state.exam };

        config.forEach((row, idx) => {
            if (idx === 0 || !row || !row.length) {
                return;
            }

            const key = row[0];

            if (!(key in configMap)) {
                return;
            }

            let value = row[1];
            const examProp = configMap[key][0];
            const processValue = configMap[key][1];

            if (processValue !== null) {
                value = processValue(value);
            }

            exam[examProp] = value;
        });

        let newQuestions = [];
        const correctOptionMap = {
            A: 0,
            B: 1,
            C: 2,
            D: 3,
            E: 4,
        };

        questions.forEach((row, idx) => {
            if (idx === 0 || !row || !row.length) {
                return;
            }

            let question = this.getEmptyQuestion();
            if (!row[0]) {
                errors.push(`Missing QUESTION title for Question in row ${idx + 1}`);
            } else {
                question.title = row[0];
            }

            if (!row[1] || !row[2]) {
                errors.push(`Not enough options provided for Question in row ${idx + 1}`);
            } else {
                question.options = [row[1], row[2]];
            }

            [3, 4, 5].forEach((optIdx) => {
                if (row[optIdx]) {
                    question.options.push(row[optIdx]);
                }
            });

            if (!row[6]) {
                errors.push(`Missing CORRECT_CHOICE_LETTER for Question in row ${idx + 1}`);
            } else {
                question.correctOptionIdx = correctOptionMap[row[6].toUpperCase()];
            }
            question.marksIfCorrect = row[7];
            question.marksIfWrong = row[8];
            question.marksIfSkipped = row[9];
            if (row[10]) {
                question.msgIfCorrect = row[10];
            }
            if (row[11]) {
                question.msgIfWrong = row[11];
            }
            question.uuid = uuid();

            newQuestions.push(question);
        });

        exam.questions = newQuestions;

        if (errors.length) {
            const errorMessage = `There was a problem with uploading this file. Please correct the following: <ul>${errors
                .map((error) => {
                    return `<li>${error}</li>`;
                })
                .join('')}</ul>`;
            this.props.setGlobalAlert({
                type: 'error',
                message: errorMessage,
            });
            this.setState({
                loading: false,
                errorMessage,
            });
        } else {
            this.setState({
                exam,
                isDirty: true,
                loading: false,
            });
        }
    };

    getEmptyQuestion = () => {
        return {
            uuid: uuid(),
            title: '',
            options: [],
            msgIfCorrect: '',
            msgIfWrong: '',
            marksIfCorrect: null,
            marksIfWrong: null,
            marksIfSkipped: null,
            correctOptionIdx: null,
        };
    };

    handleDragAndDrop = (result) => {
        if (!result.destination || result.source.index === result.destination.index) {
            return;
        }

        let items = [...this.state.exam.questions];
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        this.setState({
            exam: {
                ...this.state.exam,
                questions: items,
            },
            isDirty: true,
        });
    };

    deleteQuestion = (idx) => {
        let questions = [...this.state.exam.questions];
        questions.splice(idx, 1);

        this.setState({
            exam: { ...this.state.exam, questions },
            isDirty: true,
        });
    };

    deleteQuestions = () => {
        this.setState({
            exam: {
                ...this.state.exam,
                questions: [],
            },
            isDirty: true,
        });
    };

    doRedirect = (docId) => {
        this.setState({
            redirect:
                this.type === 'Quiz'
                    ? `/admin/courses/${this.props.match.params.courseId}/chapters/${this.props.match.params.chapterId}/lessons/${docId}`
                    : `/admin/courses/ext/exams/edit/${docId}`,
        });
    };

    handleAddQuestion = () => {
        this.setState(
            {
                exam: {
                    ...this.state.exam,
                    questions: [...this.state.exam.questions, this.getEmptyQuestion()],
                },
            },
            () => {
                if (this.lastQuestionRef.current) {
                    this.lastQuestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            }
        );
    };

    render() {
        let mainContent;

        if (this.state.redirect) {
            mainContent = <Redirect to={this.state.redirect} />;
        } else if (this.state.loading) {
            mainContent = <Spinner />;
        } else {
            mainContent = (
                <>
                    {this.state.errorMessage ? (
                        <p
                            style={{ color: 'red', fontWeight: 'bold' }}
                            dangerouslySetInnerHTML={{
                                __html: this.state.errorMessage,
                            }}
                        ></p>
                    ) : (
                        <></>
                    )}
                    <ConfirmationModal
                        show={this.state.modalShow}
                        hideModal={() => {
                            this.setState({
                                modalShow: false,
                            });
                        }}
                        confirmAction={() => {
                            this.deleteQuestions();
                            this.setState({
                                modalShow: false,
                            });
                        }}
                        titleText={'Are you sure?'}
                        bodyText={['You are about to ', <strong key='modal-type'>delete</strong>, ' all Questions.']}
                    />
                    {this.props.type === 'Quiz' && (
                        <div className='examForm-actions'>
                            {(this.props.editable || this.type === 'Quiz') && (
                                <Button type='button' className='bd' onClick={this.handleAddQuestion}>
                                    Add Question
                                </Button>
                            )}
                            {this.state.exam.questions &&
                                this.state.exam.questions.length > 0 &&
                                (this.props.editable || this.type === 'Quiz') && (
                                    <Button
                                        type='button'
                                        className='btn--danger'
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            this.setState({
                                                modalShow: true,
                                            });
                                        }}
                                    >
                                        Delete all questions
                                    </Button>
                                )}
                            <button type='button' className='bp examForm-actions__save' onClick={this.handleSubmit}>
                                Save
                            </button>
                        </div>
                    )}

                    <Form onSubmit={this.handleSubmit} id='examForm'>
                        <Row className='pt-3'>
                            <Col xs={12} md={6}>
                                <FormGroup>
                                    <Form.Label htmlFor='title'>Title</Form.Label>
                                    <Form.Control
                                        type='text'
                                        required
                                        minLength='3'
                                        maxLength='512'
                                        id='title'
                                        name='title'
                                        value={this.state.exam.title}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            {this.props.handleQuizChange && !this.props.editable ? (
                                <Col xs={12} md={6}></Col>
                            ) : (
                                <Col xs={12} md={6}>
                                    <FormGroup>
                                        <Form.Label htmlFor='import'>Import from Excel</Form.Label>
                                        <Form.Control
                                            type='file'
                                            accept='.xlsx'
                                            id='import'
                                            name='import'
                                            onChange={this.handleUpload}
                                        />
                                    </FormGroup>
                                </Col>
                            )}
                        </Row>
                        <Row className='pt-4'>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='passPct'>Pass Percentage</Form.Label>
                                    <Form.Control
                                        type='number'
                                        required
                                        min='0'
                                        max='100'
                                        id='passPct'
                                        name='passPct'
                                        value={this.state.exam.passPct}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='questionSubsetCount'>Question Subset Count</Form.Label>
                                    <Form.Control
                                        type='number'
                                        required
                                        id='questionSubsetCount'
                                        name='questionSubsetCount'
                                        value={this.state.exam.questionSubsetCount}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='timeLimit'>Time Limit (mins)</Form.Label>
                                    <Form.Control
                                        type='number'
                                        required
                                        min='0'
                                        max='9999'
                                        id='timeLimit'
                                        name='timeLimit'
                                        value={this.state.exam.timeLimit}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='marksIfCorrect'>Marks if Correct</Form.Label>
                                    <Form.Control
                                        type='number'
                                        required
                                        id='marksIfCorrect'
                                        name='marksIfCorrect'
                                        value={this.state.exam.marksIfCorrect}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='marksIfWrong'>Marks if Wrong</Form.Label>
                                    <Form.Control
                                        type='number'
                                        required
                                        id='marksIfWrong'
                                        name='marksIfWrong'
                                        value={this.state.exam.marksIfWrong}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='marksIfSkipped'>Marks if Skipped</Form.Label>
                                    <Form.Control
                                        type='number'
                                        required
                                        id='marksIfSkipped'
                                        name='marksIfSkipped'
                                        value={this.state.exam.marksIfSkipped}
                                        onChange={this.handleChange}
                                        readOnly={this.props.handleQuizChange && !this.props.editable}
                                    />
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='allowSkip'>Allow Skip</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='allowSkip'
                                        name='allowSkip'
                                        required
                                        value={this.state.exam.allowSkip}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='true'>Yes</option>
                                        <option value='false'>No</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='blocksFutureLessons'>Blocks Future Lessons</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='blocksFutureLessons'
                                        name='blocksFutureLessons'
                                        required
                                        value={this.state.exam.blocksFutureLessons}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='true'>Yes</option>
                                        <option value='false'>No</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='randomize'>Randomize</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='randomize'
                                        name='randomize'
                                        required
                                        value={this.state.exam.randomize}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='true'>Yes</option>
                                        <option value='false'>No</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='timeoutAction'>Timeout Action</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='timeoutAction'
                                        name='timeoutAction'
                                        required
                                        value={this.state.exam.timeoutAction}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='submit'>Submit</option>
                                        <option value='cancel'>Cancel</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='notifyStudent'>Notify Student</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='notifyStudent'
                                        name='notifyStudent'
                                        required
                                        value={this.state.exam.notifyStudent}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='never'>Never</option>
                                        <option value='always'>Always</option>
                                        <option value='on_pass'>On Pass</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='notifyAcademy'>Notify Academy</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='notifyAcademy'
                                        name='notifyAcademy'
                                        required
                                        value={this.state.exam.notifyAcademy}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='never'>Never</option>
                                        <option value='always'>Always</option>
                                        <option value='on_pass'>On Pass</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='revealAnswers'>Reveal Answers</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='revealAnswers'
                                        name='revealAnswers'
                                        required
                                        value={this.state.exam.revealAnswers}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='never'>Never</option>
                                        <option value='always'>Always</option>
                                        <option value='on_pass'>On Pass</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='allowReattempt'>Allow Reattempt</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='allowReattempt'
                                        name='allowReattempt'
                                        required
                                        value={this.state.exam.allowReattempt}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='never'>Never</option>
                                        <option value='always'>Always</option>
                                        <option value='on_fail'>On Fail</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={3} xl={2}>
                                <FormGroup>
                                    <Form.Label htmlFor='isFinal'>Is Final</Form.Label>
                                    <Form.Control
                                        as='select'
                                        id='isFinal'
                                        name='isFinal'
                                        required
                                        value={this.state.exam.isFinal}
                                        onChange={this.handleChange}
                                        disabled={this.props.handleQuizChange && !this.props.editable}
                                    >
                                        <option disabled value=''></option>
                                        <option value='true'>Yes</option>
                                        <option value='false'>No</option>
                                    </Form.Control>
                                </FormGroup>
                            </Col>
                        </Row>

                        <Button type='button' className='bd' onClick={this.handleAddQuestion}>
                            Add Question
                        </Button>

                        {this.state.exam.questions ? (
                            <>
                                {this.state.exam.questions.length > 0 && (
                                    <Row className='pt-4'>
                                        <Col>
                                            <FormGroup>
                                                <Form.Label>Questions</Form.Label>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                )}
                                <DragDropContext onDragEnd={this.handleDragAndDrop}>
                                    <Droppable droppableId='examQuestions'>
                                        {(provided) => (
                                            <ul
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                style={{
                                                    listStyleType: 'none',
                                                    padding: '0px',
                                                    margin: '0px',
                                                }}
                                            >
                                                {this.state.exam.questions.map((question, idx) => {
                                                    return (
                                                        <Draggable
                                                            key={`draggable-${question.uuid}`}
                                                            draggableId={question.uuid}
                                                            index={idx}
                                                        >
                                                            {(provided) => (
                                                                <li
                                                                    ref={mergeRefs(
                                                                        provided.innerRef,
                                                                        idx === this.state.exam.questions.length - 1
                                                                            ? this.lastQuestionRef
                                                                            : undefined
                                                                    )}
                                                                    {...provided.draggableProps}
                                                                >
                                                                    <Row className='my-2'>
                                                                        <Col>
                                                                            <ExamQuestion
                                                                                dragHandleProps={
                                                                                    provided.dragHandleProps
                                                                                }
                                                                                question={question}
                                                                                handleQuestionChange={
                                                                                    this.handleQuestionChange
                                                                                }
                                                                                deleteQuestion={this.deleteQuestion}
                                                                                idx={idx}
                                                                                editable={this.props.editable}
                                                                                handleQuizChange={
                                                                                    this.props.handleQuizChange
                                                                                }
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                </li>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
                                                {provided.placeholder}
                                            </ul>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </>
                        ) : (
                            <></>
                        )}
                    </Form>
                </>
            );
        }

        return (
            <>
                <RouteLeavingGuard
                    when={this.state.isDirty}
                    navigate={(path) => this.props.history.push(path)}
                    shouldBlockNavigation={() => {
                        return this.state.isDirty;
                    }}
                />
                {mainContent}
            </>
        );
    }
}

export default connect(
    (state) => {
        return {
            formActions: state.formActions,
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
)(withRouter(ExamForm));
