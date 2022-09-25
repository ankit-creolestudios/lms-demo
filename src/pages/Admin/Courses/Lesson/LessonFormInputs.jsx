import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import apiCall from '../../../../helpers/apiCall';
import AdminLessonContext from './AdminLessonContext';
import './LessonFormInputs.scss';

class LessonFormInputs extends Component {
    static contextType = AdminLessonContext;

    state = {
        currentLessonId: this.context?.lesson?._id ?? '',
    };

    componentDidMount() {
        this.context.updateLessonForm({
            title: this.context?.lesson?.draft?.title ?? '',
            hasQuiz: this.context?.lesson?.draft?.hasQuiz ?? false,
            lessonLayout: this.context?.lesson?.draft?.lessonLayout ?? 'PAGE',
            lessonType: this.context?.lesson?.draft?.lessonType ?? 'BASIC',
            unlockNextLesson: this.context?.lesson?.draft?.unlockNextLesson ?? 'ALWAYS_UNLOCKED',
            lessonTypeComment: this.context?.lesson?.draft?.lessonTypeComment ?? '',
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentLessonId !== (this.context?.lesson?._id ?? '')) {
            this.setState(
                {
                    currentLessonId: this.context?.lesson?._id ?? '',
                },
                () => {
                    this.context.updateLessonForm({
                        title: this.context?.lesson?.draft?.title ?? '',
                        hasQuiz: this.context?.lesson?.draft?.hasQuiz ?? false,
                        lessonLayout: this.context?.lesson?.draft?.lessonLayout ?? 'PAGE',
                        lessonType: this.context?.lesson?.draft?.lessonType ?? 'BASIC',
                        unlockNextLesson: this.context?.lesson?.draft?.unlockNextLesson ?? 'ALWAYS_UNLOCKED',
                        lessonTypeComment: this.context?.lesson?.draft?.lessonTypeComment ?? '',
                    });
                }
            );
        }
    }

    handleInputChange = (e) => {
        const input = e.target;

        this.context.updateLessonForm(
            {
                [input.name]: input.value,
            },
            this.context.enableSaveButton
        );
    };

    render() {
        const { title, lessonLayout = 'PAGE', lessonType, lessonTypeComment } = this.props.lessonForm;
        return (
            <form className='lesson-inputs'>
                <div>
                    <label htmlFor='title'>Lesson name</label>
                    <input type='text' name='title' id='title' defaultValue={title} onChange={this.handleInputChange} />
                </div>
                <div className='lessonType'>
                    <label htmlFor='lessonType'>Lesson type</label>
                    <select name='lessonType' id='lessonType' value={lessonType} onChange={this.handleInputChange}>
                        <option value='BASIC'>Basic</option>
                        <option value='STATE'>State</option>
                        <option value='NATIONAL'>National</option>
                    </select>
                </div>
                <div className={`lessonTypeComment${lessonType === 'BASIC' ? ' disabled' : ''}`}>
                    {lessonType !== 'BASIC' && (
                        <>
                            <label htmlFor='lessonTypeComment'>Lesson type comment</label>
                            <textarea
                                id='lessonTypeComment'
                                name='lessonTypeComment'
                                defaultValue={lessonTypeComment}
                                onChange={this.handleInputChange}
                            />
                        </>
                    )}
                </div>
            </form>
        );
    }
}

export default withRouter(LessonFormInputs);
