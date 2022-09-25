import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { RiMenuUnfoldLine, RiMenuFoldLine } from 'react-icons/ri';
import LessonContext from '../LessonContext';
import { Api, EventBus } from 'src/helpers/new';
import { Spinner } from 'src/components/Spinner';
import Progress from './Progress';
import Chapter, { IChapter } from './Chapter';
import './NavigationSidebar.scss';
import { Button } from 'react-bootstrap';

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

interface IProps {
    course: any;
}

type TProps = IProps & RouteComponentProps<IRouteProps>;

interface IState {
    isLoading: boolean;
    minimised: boolean;
    chapters: IChapter[];
}

class NavigationSidebar extends Component<TProps, IState> {
    static contextType = LessonContext;

    state: IState = {
        isLoading: true,
        minimised: true,
        chapters: [],
    };

    async componentDidMount() {
        const { success, response } = await Api.call(
            'get',
            `/users/courses/${this.props.match.params.courseId}/chapters`
        );
        if (success) {
            this.setState({ chapters: response, isLoading: false });
        }
        EventBus.on('toggle-nav-sidebar', this.toggleSidebar);
    }

    toggleSidebar = () => {
        this.setState({ minimised: !this.state.minimised });
    };

    render() {
        const { chapters, isLoading, minimised } = this.state;
        const { course } = this.props;

        if (isLoading) return <Spinner />;
        return (
            <div className={`navigation-sidebar-container ${minimised ? 'minimised' : ''}`}>
                <div className={`navigation-sidebar`}>
                    <div className='navigation-sidebar-header'>
                        <span>
                            <i onClick={this.toggleSidebar}>
                                <RiMenuFoldLine />
                            </i>

                            <h3>{course.title}</h3>
                        </span>
                        <Progress />
                    </div>
                    {chapters.map((chapter: IChapter) => {
                        return <Chapter key={chapter._id} _id={chapter._id} title={chapter.title} />;
                    })}
                </div>
            </div>
        );
    }
}

export default withRouter(NavigationSidebar);
