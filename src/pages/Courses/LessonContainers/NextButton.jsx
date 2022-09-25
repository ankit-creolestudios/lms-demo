import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { withRouter } from 'react-router';
import ConditionalWrapper from '../../../components/ConditionalWrapper';
import apiCall from '../../../helpers/apiCall';

class NextButton extends Component {
    state = {
        disabled: '',
        canSitExam: false,
    };

    componentDidMount() {
        this.fetchData();
    }

    componentDidUpdate(prevProps, prevState) {
        const { isBlockedByNodes, cardsQuiz: { isInQuiz, questionIndex, answerInc = 0 } = {} } =
                this.props.lessonContext,
            {
                isBlockedByNodes: prevIsBlockedByNodes,
                cardsQuiz: { questionIndex: prevQuestionIndex, answerInc: prevAnswerInc = 0 } = {},
            } = prevProps.lessonContext;

        if (
            this.props.match.params.lessonId !== prevProps.match.params.lessonId ||
            this.props.activeCardIndex !== prevProps.activeCardIndex ||
            isBlockedByNodes !== prevIsBlockedByNodes ||
            (!!isInQuiz && (answerInc !== prevAnswerInc || questionIndex !== prevQuestionIndex))
        ) {
            this.fetchData();
        }
    }

    fetchData = () => {
        if (this.props.lessonContext?.isAdminPreview) {
            this.checkNextLesson();
            this.canUserSitExam();
        } else {
            this.props.lessonContext.enableNextButton(() => {
                this.checkNextLesson();
                this.canUserSitExam();
            });
        }
    };

    checkNextLesson() {
        const { nextLesson, unlockNextLesson, cards } = this.props.lessonContext,
            { activeCardIndex } = this.props,
            cardsLength = cards?.length,
            card = cards?.[activeCardIndex],
            { isInQuiz, allowSkip, answers, questionIndex } = this.props.lessonContext.cardsQuiz ?? {};

        if (!!isInQuiz && !allowSkip && typeof answers[questionIndex] !== 'number') {
            this.setState({
                disabled: 'You must provide an answer for this question before progressing any further',
            });

            return;
        }

        if (!this.props.lessonContext?.isAdminPreview) {
            if (activeCardIndex !== undefined) {
                if (card?.cardType === 'SINGLE_QUESTION') {
                    if (card?.nextCardAvailable === 'AFTER_CORRECT' && card?.questionAttempt?.status !== 'passed') {
                        this.setState({
                            disabled: 'You must answer this question correctly in other to progress any further',
                        });

                        return;
                    }

                    if (card?.nextCardAvailable === 'AFTER_ANSWER' && !card?.questionAttempt) {
                        this.setState({
                            disabled: 'You must attempt to answer this question in other to progress any further',
                        });

                        return;
                    }
                }

                if (
                    ['HOTSPOT_LIST', 'HOTSPOT_MAP', 'MNEMONIC'].includes(card?.cardType) &&
                    this.props.lessonContext?.isBlockedByNodes
                ) {
                    this.setState({
                        disabled: 'You must view all nodes in other to progress any further',
                    });

                    return;
                }
            }

            if (
                ((activeCardIndex !== undefined && activeCardIndex === cardsLength - 1) ||
                    activeCardIndex === undefined) &&
                nextLesson
            ) {
                if (!nextLesson.unlocked) {
                    if (unlockNextLesson === 'REQUIRED_TIME_MET') {
                        this.setState({
                            disabled: 'The timer must reach 0 before you can progress any further',
                        });
                    }

                    if (unlockNextLesson === 'ON_QUIZ_START') {
                        this.setState({
                            disabled: 'You must start a quiz attempt before you can progress any further',
                        });
                    }

                    if (unlockNextLesson === 'ON_QUIZ_END') {
                        this.setState({
                            disabled: 'You must complete a quiz attempt before you can progress any further',
                        });
                    }

                    if (unlockNextLesson === 'ON_QUIZ_PASS') {
                        this.setState({
                            disabled: 'You must pass a quiz attempt before you can progress any further',
                        });
                    }
                }
            }
        }

        this.setState({
            disabled: '',
        });
    }

    handleClick = () => {
        const { courseId } = this.props.match.params,
            {
                nextLesson,
                isAdminPreview,
                cardsQuiz: { isInQuiz, answers, allowSkip, questionIndex } = {},
            } = this.props.lessonContext,
            { disabled } = this.state;

        if (!isInQuiz && !nextLesson) {
            if (this.state.canSitExam) {
                this.props.history.push(`/courses/${courseId}/preexam`);
            }
            return;
        }

        if (
            !(
                isAdminPreview ||
                (isInQuiz && (allowSkip || (!allowSkip && typeof answers[questionIndex] === 'number'))) ||
                !disabled ||
                nextLesson?.unlocked ||
                (nextLesson && this.state.canSitExam)
            )
        ) {
            return;
        }

        const proceedToNextLesson =
            typeof this.props.middleware === 'function' ? this.props.middleware(this.state.canSitExam) : true;

        if (!proceedToNextLesson || isAdminPreview) {
            return;
        }

        const { userChapterId: chapterId, _id: lessonId } = nextLesson;

        this.props.history.push(`/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`);
    };

    canUserSitExam = async () => {
        const { success, response } = await apiCall('GET', `/users/exam/${this.props.match.params.courseId}/available`);

        if (success) {
            this.setState({ canSitExam: response.available });
        }
    };

    render() {
        const { visible, children } = this.props,
            { disabled } = this.state,
            {
                isAdminPreview,
                nextLesson,
                cardsQuiz: { isInQuiz, allowSkip, answers, questionIndex, questionsLength } = {},
            } = this.props.lessonContext;

        return (
            <ConditionalWrapper
                condition={
                    (!!isInQuiz && !allowSkip && typeof answers[questionIndex] !== 'number' && !isAdminPreview) ||
                    (!isInQuiz && (!!disabled || !nextLesson?.unlocked) && !isAdminPreview && !!nextLesson) ||
                    (!isInQuiz && !nextLesson && !this.state.canSitExam && !isAdminPreview)
                }
                wrapper={(children) => (
                    <OverlayTrigger overlay={<Tooltip id={`tooltip-next-lesson`}>{disabled}</Tooltip>}>
                        {children}
                    </OverlayTrigger>
                )}>
                <div
                    className={`lesson-button lesson-button--next${!visible ? ' lesson-button--hidden' : ''}${
                        (!!isInQuiz && !allowSkip && typeof answers[questionIndex] !== 'number' && !isAdminPreview) ||
                        (!isInQuiz && (!!disabled || !nextLesson?.unlocked) && !isAdminPreview && !!nextLesson) ||
                        (!isInQuiz && !nextLesson && !this.state.canSitExam && !isAdminPreview)
                            ? ' lesson-button--disabled'
                            : ''
                    }`}
                    onClick={this.handleClick}>
                    {children ? (
                        children
                    ) : (
                        <>
                            {!isInQuiz
                                ? !nextLesson
                                    ? 'Take final exam'
                                    : 'Next'
                                : questionIndex === questionsLength - 1
                                ? 'Submit'
                                : 'Next'}
                            <Fa icon={faChevronRight} />
                        </>
                    )}
                </div>
            </ConditionalWrapper>
        );
    }
}

export default withRouter(NextButton);
