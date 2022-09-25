import React, { Component } from 'react';
import Search from 'src/components/_New/Search/';
import SearchResult from './SearchResult';
import { Api } from 'src/helpers/new';
import './LessonProctoringInputs.scss';

interface IProps {
    checkpoints: string[];
    onChange: (checkpoints: string[]) => void;
    courseId: string;
}

interface IState {
    checkpoints: ICheckpoint[];
}

interface ICheckpoint {
    lessonId: string;
    lessonName: string;
}

export default class LessonProctoringInputs extends Component<IProps, IState> {
    state: IState = {
        checkpoints: [],
    };

    componentDidMount() {
        this.fetchCheckpointsDetails(this.props.checkpoints);
    }

    componentDidUpdate(prevProps: IProps) {
        const oldCheckpoints = prevProps.checkpoints;
        const newCheckpoints = this.props.checkpoints;
        if (JSON.stringify(oldCheckpoints) !== JSON.stringify(newCheckpoints)) {
            const addedCheckpoints = newCheckpoints.filter(
                (lessonId1) => !oldCheckpoints.some((lessonId2) => lessonId1 === lessonId2)
            );
            this.fetchCheckpointsDetails(addedCheckpoints);
        }
    }

    fetchCheckpointsDetails = async (checkpoints: string[]) => {
        const { success, response } = await Api.call('post', `courses/proctoring/checkpoints`, { checkpoints });
        if (success) {
            this.setState({ checkpoints: [...this.state.checkpoints, ...response] });
        }
    };

    handleSelect = ({ _id: lessonId }: { _id: string }) => {
        this.addLesson(lessonId);
    };

    addLesson = (lessonId: string) => {
        if (this.props.checkpoints.includes(lessonId)) return;

        this.props.onChange([...this.props.checkpoints, lessonId]);
    };

    removeLesson = (lessonId: string) => {
        this.setState(
            {
                checkpoints: this.state.checkpoints.filter(
                    (checkpoint: ICheckpoint) => checkpoint.lessonId !== lessonId
                ),
            },
            () => {
                this.props.onChange(this.props.checkpoints.filter((checkpoint: string) => checkpoint !== lessonId));
            }
        );
    };

    render() {
        const { courseId } = this.props;
        return (
            <div className='lesson-proctoring-inputs'>
                <h5>Checkpoints</h5>
                <Search
                    endpoint={`courses/proctoring/${courseId}/lessons`}
                    searchOptions={{ regex: 'i', limit: 5 }}
                    result={SearchResult}
                    onSelect={this.handleSelect}
                    auto
                    noButton
                    searchOnEnter
                    placeholder='Search Lessons'
                />
                {this.state.checkpoints.length > 0 && (
                    <div className='checkpoints'>
                        {this.state.checkpoints.map((checkpoint: ICheckpoint, index) => {
                            return (
                                <div className='checkpoint' key={index}>
                                    <h5>{`${checkpoint.lessonName}`}</h5>
                                    <div
                                        className='delete-container'
                                        onClick={() => {
                                            this.removeLesson(checkpoint.lessonId);
                                        }}
                                    >
                                        <i className='fas fa-trash' />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }
}
