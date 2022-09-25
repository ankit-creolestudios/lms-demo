import React, { Component } from 'react';
import apiCall from '../../../helpers/apiCall';
import { LastAttempts } from '../../Courses/CardTypes/EndOfChapterQuiz';
import { QuestionsModal } from '../../Courses/QuestionsModal';

export default class CourseExams extends Component {
    state = {
        lastAttempts: [],
        attemptToShow: null,
        showAttempts: false,
    };

    componentDidMount = () => {
        this.loadAttempts();
    };

    loadAttempts = async () => {
        const { success, response } = await apiCall('GET', `/users/exam/${this.props.courseId}`);

        if (success && response) {
            this.setState({
                lastAttempts: response.lastAttempts,
            });
        }
    };

    hideLastAttempt = () => {
        this.setState({
            attemptToShow: null,
        });
    };

    render() {
        return (
            <div className='pt-3'>
                {this.state.lastAttempts && this.state.lastAttempts.length ? (
                    <div>
                        <div className='last-attempts'>
                            <LastAttempts
                                items={this.state.lastAttempts}
                                onItemClick={(attemptToShow) => {
                                    this.setState({
                                        attemptToShow,
                                    });
                                }}
                            />
                        </div>

                        {this.state.attemptToShow && (
                            <QuestionsModal
                                show={!!this.state.attemptToShow}
                                onHide={this.hideLastAttempt}
                                questions={this.state.attemptToShow?.questions}
                                title={this.state.attemptToShow?.title}
                                answers={this.state.attemptToShow?.answers}
                                attempt={this.state.attemptToShow}
                                readOnly={true}
                            />
                        )}
                    </div>
                ) : (
                    'User did not attempt to take the exam yet'
                )}
            </div>
        );
    }
}
