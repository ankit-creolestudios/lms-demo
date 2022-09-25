import React, { Component } from 'react';
import { RiMenuUnfoldLine, RiMenuFoldLine } from 'react-icons/ri';
import { Api, EventBus } from 'src/helpers/new';
import './Header.scss';

interface IProps {
    lessonName: string;
    chapterId: string;
    userCourseId: string;
}

interface IState {
    chapterName: string;
}

interface IChapter {
    _id: string;
    title: string;
}

export default class Header extends Component<IProps, IState> {
    state: IState = {
        chapterName: '',
    };

    async componentDidMount() {
        const { success, response } = await Api.call('get', `/users/courses/${this.props.userCourseId}/chapters`);
        if (success) {
            const chapterName = response.find(({ _id }: IChapter) => _id === this.props.chapterId).title;

            this.setState({
                chapterName,
            });
        }
    }

    toggleSidebar = () => {
        EventBus.dispatch('toggle-nav-sidebar');
    };

    render() {
        //pull the chapter name from context, it will probably be set in the progressionManager
        return (
            <div className='lesson-page-header'>
                <i onClick={this.toggleSidebar}>
                    <RiMenuUnfoldLine />
                </i>
                {this.state.chapterName}
                <span>
                    <i className='fas fa-chevron-right' />
                </span>
                {this.props.lessonName}
            </div>
        );
    }
}
