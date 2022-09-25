import React, { Component, useContext } from 'react';
import { Card, Col, Row, Accordion, Form } from 'react-bootstrap';
import { faCaretDown, faCaretUp, faPencilAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AccordionContext from 'react-bootstrap/AccordionContext';
import apiCall from '../../../helpers/apiCall';
import Table from '../../../components/Table/Table';
import { DownloadLink } from '../../../components/ApiFile';

function CaretToggle() {
    const currentEventKey = useContext(AccordionContext);

    return (
        <span className='pull-right' style={{ cursor: 'pointer' }}>
            <FontAwesomeIcon
                className='float-right'
                style={{
                    fontSize: '20px',
                }}
                icon={currentEventKey ? faCaretUp : faCaretDown}
            />
        </span>
    );
}

export default class CourseForms extends Component {
    state = {
        userCourse: null,
    };

    inputTypeMap = {
        text: 'text',
        number: 'number',
        date: 'date',
        file: 'url',
        textarea: 'textarea',
        options: 'select',
        checkbox: 'checkbox',
        radio: 'radio',
        dropdown: 'select',
        'social security number': 'text',
        'date of birth': 'date',
    };

    accordionKeyMap = {
        enrollment: {
            title: 'Enrollment',
        },
        preExam: {
            title: 'Pre Exam',
        },
        postExam: {
            title: 'Post Exam',
        },
    };

    componentDidMount = async () => {
        const { success, response } = await apiCall('GET', `/users/courses/${this.props.doc._id}/admin`);
        if (success && response) {
            let userCourse = { ...response[0] };
            Object.keys(this.accordionKeyMap).map((key) => {
                userCourse[key + 'UpdatedAt'] = response[0][key + 'UpdatedAt']
                    ? new Date(response[0][key + 'UpdatedAt']).toLocaleDateString('en-US') +
                      ' ' +
                      new Date(response[0][key + 'UpdatedAt']).toLocaleTimeString('en-US')
                    : '-';
            });
            this.setState({
                userCourse,
            });
        }
    };

    toggleFieldEditable = (fieldId, key, editable) => {
        this.setState({
            userCourse: {
                ...this.state.userCourse,
                [key + 'Form']: {
                    ...this.state.userCourse[key + 'Form'],
                    fields: this.state.userCourse[key + 'Form'].fields.map((field, j) => {
                        if (fieldId === field._id) {
                            field.editable = editable;
                        }
                        return field;
                    }),
                },
            },
        });
    };

    handleAnswerSave = async (formKey, field, value) => {
        const { success, response } = await apiCall(
            'PUT',
            `/users/enrollment/${this.state.userCourse._id}/${field.key}`,
            {
                value: value,
            }
        );

        if (success) {
            this.toggleFieldEditable(field._id, formKey, false);
        }
    };

    handleAnswerChange = (formKey, courseForm, fieldKey, value) => {
        this.setState({
            userCourse: {
                ...this.state.userCourse,
                [formKey + 'Form']: {
                    ...courseForm,
                    answers: {
                        ...courseForm.answers,
                        [fieldKey]: value,
                    },
                },
            },
        });
    };

    handleMulticheckboxChange = (formKey, courseForm, fieldKey, option, checked) => {
        let currentAnswer = courseForm.answers[fieldKey];
        let newAnswers = currentAnswer.map((thisItem) => {
            if (Object.keys(thisItem)[0] === option.value) {
                thisItem[option.value] = checked;
            }
            return thisItem;
        });
        this.handleAnswerChange(formKey, courseForm, fieldKey, newAnswers);
    };

    getField = (field, key) => {
        const inputType = this.inputTypeMap[field.inputType],
            courseForm = this.state.userCourse[key + 'Form'];
        let answer = courseForm.answers[field.key];
        if (inputType === 'checkbox') {
            if (field.extra.multiple) {
                let multipleAns = [];
                answer?.map((ans) => {
                    if (Object.values(ans)[0]) {
                        multipleAns.push(Object.keys(ans)[0]);
                    }
                });
                if (multipleAns.length > 0) {
                    answer = multipleAns.join(',');
                } else {
                    answer = 'None';
                }
            } else {
                answer = courseForm.answers[field.key] ? 'yes' : 'NO';
            }
        }

        return field.editable && inputType && inputType !== 'url' ? (
            inputType === 'textarea' ? (
                <textarea
                    value={answer}
                    onChange={(event) => {
                        this.handleAnswerChange(key, courseForm, field.key, event.target.value);
                    }}
                ></textarea>
            ) : inputType === 'select' ? (
                <select
                    className='form-control'
                    value={answer}
                    onChange={(event) => {
                        this.handleAnswerChange(key, courseForm, field.key, event.target.value);
                    }}
                >
                    {field.extra.options.map((option, j) => {
                        return (
                            <option value={option} key={`${field.key}-${j}`}>
                                {option}
                            </option>
                        );
                    })}
                </select>
            ) : inputType === 'checkbox' ? (
                <div>
                    {field.extra.multiple && field.extra.options.length > 0 ? (
                        <div>
                            {field.extra.options.map((option, j) => {
                                let optionAnswer = courseForm.answers[field.key].find((answer) => {
                                    if (Object.keys(answer)[0] === option?.value) {
                                        return true;
                                    }
                                });
                                let checked = optionAnswer[option.value];
                                return (
                                    <Form.Check
                                        key={`${field.key}-${j}`}
                                        type='checkbox'
                                        label={option?.value}
                                        required={option?.required}
                                        disabled={option?.required}
                                        checked={checked}
                                        onChange={(event) => {
                                            this.handleMulticheckboxChange(
                                                key,
                                                courseForm,
                                                field.key,
                                                option,
                                                event.target.checked
                                            );
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div>
                            <Form.Check
                                key={`${field.key}`}
                                type='checkbox'
                                label={field.label}
                                required={field.required}
                                disabled={field.required}
                                checked={courseForm.answers[field.key]}
                                onChange={(event) => {
                                    this.handleAnswerChange(key, courseForm, field.key, event.target.checked);
                                }}
                            />
                        </div>
                    )}
                </div>
            ) : inputType === 'radio' ? (
                <div>
                    {field.extra.options.map((option, j) => {
                        return (
                            <Form.Check
                                key={`${field.key}-${j}`}
                                type='radio'
                                name={field.label}
                                label={option}
                                checked={answer === option}
                                onChange={(event) => {
                                    this.handleAnswerChange(key, courseForm, field.key, option);
                                }}
                            />
                        );
                    })}
                </div>
            ) : (
                <Form.Control
                    type={inputType}
                    value={answer}
                    maxLength={field.key === 'ssnKey' ? field.extra.numberOfDigits : 0}
                    minLength={field.key === 'ssnKey' ? field.extra.numberOfDigits : 0}
                    onChange={(event) => {
                        this.handleAnswerChange(key, courseForm, field.key, event.target.value);
                    }}
                />
            )
        ) : inputType === 'url' ? (
            <DownloadLink fileId={answer}>Click to download</DownloadLink>
        ) : (
            <>{String(answer)}</>
        );
    };

    render() {
        return (
            <div className='pt-3'>
                {Object.keys(this.accordionKeyMap).map((key) => {
                    return (
                        <Accordion defaultActiveKey={null} className='py-2' key={key}>
                            <Card>
                                <Accordion.Toggle
                                    as={Card.Header}
                                    eventKey='0'
                                    style={{
                                        backgroundColor: '#dcf5ee',
                                    }}
                                >
                                    <Row>
                                        <Col
                                            xs={8}
                                            style={{
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            {this.accordionKeyMap[key].title}
                                        </Col>
                                        <Col xs={3}>
                                            {this.state.userCourse &&
                                            this.state.userCourse[key + 'UpdatedAt'] !== '-' ? (
                                                <div className='float-right'>
                                                    <span>
                                                        <strong>Completed: </strong>
                                                        {this.state.userCourse
                                                            ? this.state.userCourse[key + 'UpdatedAt']
                                                            : '-'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <></>
                                            )}
                                        </Col>
                                        <Col xs={1}>
                                            <Accordion.Toggle
                                                as={CaretToggle}
                                                className='mx-1'
                                                eventKey='1'
                                            ></Accordion.Toggle>
                                        </Col>
                                    </Row>
                                </Accordion.Toggle>
                                <Accordion.Collapse eventKey='0'>
                                    <Card.Body>
                                        {this.state.userCourse && this.state.userCourse[key + 'Form'] ? (
                                            <Table
                                                columns={[
                                                    {
                                                        text: 'Field',
                                                        field: 'label',
                                                    },
                                                    {
                                                        text: 'Value',
                                                        field: (field) => {
                                                            return this.getField(field, key);
                                                        },
                                                    },
                                                ]}
                                                rows={
                                                    Array.isArray(this.state?.userCourse?.[key + 'Form']?.fields) &&
                                                    this.state.userCourse[key + 'Form'].fields.filter((field) => {
                                                        return this.inputTypeMap[field.inputType];
                                                    })
                                                }
                                                rowButtons={[
                                                    {
                                                        type: 'submit',
                                                        text: (field) => {
                                                            return field.editable ? 'Save' : 'Edit';
                                                        },
                                                        icon: (field) => {
                                                            return field.editable ? faCheck : faPencilAlt;
                                                        },
                                                        condition: (field) => {
                                                            const inputType = this.inputTypeMap[field.inputType];
                                                            return inputType && inputType !== 'url';
                                                        },
                                                        clickCallback: (e, field) => {
                                                            if (!field.editable) {
                                                                this.toggleFieldEditable(field._id, key, true);
                                                            } else {
                                                                const answer =
                                                                    this.state.userCourse[key + 'Form'].answers[
                                                                        field.key
                                                                    ];
                                                                this.handleAnswerSave(key, field, answer);
                                                            }
                                                        },
                                                    },
                                                ]}
                                            />
                                        ) : (
                                            <div>{this.accordionKeyMap[key].title} has not been completed yet.</div>
                                        )}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                    );
                })}
            </div>
        );
    }
}
