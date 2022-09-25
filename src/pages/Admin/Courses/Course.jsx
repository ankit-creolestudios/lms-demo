import React, { Component } from 'react';
import {
    Enrollment,
    PreExam,
    ExamTable,
    PostExam,
    Certificate,
    Extensions,
    CourseForm,
    Proctoring,
    Reporting,
    Notifications
} from './Tabs';
import ExamForm from './ExamForm';
import { Nav } from 'react-bootstrap';
import { Link, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import './Course.scss';

class Course extends Component {
    render() {
        return (
            <div id='course'>
                {this.props.location.pathname.indexOf('/admin/courses/ext/') < 0 ? (
                    <Nav variant='tabs' activeKey={this.props.location.pathname}>
                        <Nav.Item key='course'>
                            <Nav.Link
                                as={Link}
                                eventKey={`/admin/courses/${this.props.match.params.courseId}`}
                                to={`/admin/courses/${this.props.match.params.courseId}`}
                            >
                                Course
                            </Nav.Link>
                        </Nav.Item>
                        {this.props.match.params.courseId !== 'new' && [
                            <Nav.Item key='enrollment'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/enrollment`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/enrollment`}
                                >
                                    Enrollment
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='pre-exam'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/pre-exam`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/pre-exam`}
                                >
                                    Pre Exam
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='exam'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/exam`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/exam`}
                                >
                                    Exam
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='post-exam'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/post-exam`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/post-exam`}
                                >
                                    Post Exam
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='messages'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/notifications`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/notifications`}
                                >
                                    Notifications
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='certificate'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/certificate`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/certificate`}
                                >
                                    Certificate
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='extensions'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/extensions`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/extensions`}
                                >
                                    Extensions
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='proctoring'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/proctoring`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/proctoring`}
                                >
                                    Proctoring
                                </Nav.Link>
                            </Nav.Item>,
                            <Nav.Item key='reporting'>
                                <Nav.Link
                                    as={Link}
                                    eventKey={`/admin/courses/${this.props.match.params.courseId}/reporting`}
                                    to={`/admin/courses/${this.props.match.params.courseId}/reporting`}
                                >
                                    Reporting
                                </Nav.Link>
                            </Nav.Item>,
                        ]}
                    </Nav>
                ) : (
                    <></>
                )}
                <div className='tab-content'>
                    <Switch>
                        <Route exact path='/admin/courses/:courseId' component={CourseForm} />
                        <Route exact path='/admin/courses/:courseId/enrollment' component={Enrollment} />
                        <Route exact path='/admin/courses/:courseId/pre-exam' component={PreExam} />
                        <Route exact path='/admin/courses/:courseId/exam' component={ExamTable} />
                        <Route exact path='/admin/courses/:courseId/post-exam' component={PostExam} />
                        <Route exact path='/admin/courses/:courseId/notifications' component={Notifications} />
                        <Route exact path='/admin/courses/:courseId/certificate' component={Certificate} />
                        <Route exact path='/admin/courses/:courseId/extensions' component={Extensions} />
                        <Route exact path='/admin/courses/:courseId/proctoring' component={Proctoring} />
                        <Route exact path='/admin/courses/:courseId/reporting' component={Reporting} />
                        <Route exact path='/admin/courses/ext/exams/edit/:courseId'>
                            <ExamForm key='exam-edit' />
                        </Route>
                        <Route exact path='/admin/courses/ext/:parentId/exams/create'>
                            <ExamForm key='exam-create' />
                        </Route>
                        <Route exact path='/admin/courses/ext/quizzes/edit/:courseId'>
                            <ExamForm key='quiz-edit' />
                        </Route>
                        <Route exact path='/admin/courses/ext/chapters/:parentId/quiz/create'>
                            <ExamForm key='quiz-create' />
                        </Route>
                    </Switch>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    setCoursePreview: (payload) => ({
        type: 'SET_PREVIEW_COURSE',
        payload,
    }),
})(withRouter(Course));
