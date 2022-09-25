import React, { Component } from 'react';
import { Api } from 'src/helpers/new';
import Lesson, { ILesson } from '../Lesson';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import './Chapter.scss';

export interface IChapter {
    _id: string;
    title: string;
}

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

type TProps = IChapter & RouteComponentProps<IRouteProps>;

interface IState {
    showLessons: boolean;
    lessons: ILesson[];
}

class Chapter extends Component<TProps, IState> {
    constructor(props: TProps) {
        super(props);
        this.state = {
            showLessons: props.match.params.chapterId === props._id,
            lessons: [],
        };
    }

    async componentDidMount() {
        const { success, response } = await Api.call('get', `/users/chapters/${this.props._id}/lessons`);
        if (success) {
            this.setState({ lessons: response.docs });
        }
    }

    componentDidUpdate(prevProps: TProps) {
        if (this.props.match.params.chapterId !== prevProps.match.params.chapterId) {
            this.setState({
                showLessons: this.props.match.params.chapterId === this.props._id,
            });
        }
    }

    toggleLessons = () => {
        this.setState({ showLessons: !this.state.showLessons });
    };

    render() {
        const { title, _id } = this.props;
        const { showLessons, lessons } = this.state;
        const titleArr = title.split('-');

        return (
            <div className='navigation-chapter'>
                <div onClick={this.toggleLessons} className='chapter'>
                    <div>
                        {titleArr.map((title, index) => {
                            return <p key={index}>{title}</p>;
                        })}
                    </div>
                    <i className={`fa fa-chevron-${showLessons ? 'up' : 'down'}`}></i>
                </div>
                {showLessons && (
                    <div className='lessons'>
                        {lessons.map((lesson: ILesson) => {
                            return <Lesson key={lesson._id} {...lesson} chapterId={_id} />;
                        })}
                    </div>
                )}
            </div>
        );
    }
}

export default withRouter(Chapter);
