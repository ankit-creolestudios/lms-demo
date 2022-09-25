import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Spinner } from 'src/components/Spinner';
import { Api } from 'src/helpers/new';
import CourseContext from 'src/pages/Course/CourseContext';
import './BioSig.scss';

interface IRouteProps {
    courseId: string;
    chapterId: string;
    lessonId: string;
}

interface IProps {
    stage: string;
}

type TProps = IProps & RouteComponentProps<IRouteProps>;

interface IState {
    isLoading: boolean;
    targetUrl: string;
}

class BioSig extends Component<TProps, IState> {
    static contextType = CourseContext;

    state: IState = {
        isLoading: true,
        targetUrl: '',
    };

    componentDidMount() {
        this.initialiseAuthentication();
    }

    initialiseAuthentication = async () => {
        const { success, response } = await Api.call('get', 'proctoring/verify/init', null, {
            courseId: this.context.course._id,
            id: this.props.stage,
        });
        if (success) {
            this.setState({ isLoading: false, targetUrl: response.redirect });
        }
    };

    render() {
        const { isLoading, targetUrl } = this.state;

        if (isLoading) return <Spinner />;

        return (
            <div className='bio-sig-auth'>
                <iframe src={targetUrl} />
            </div>
        );
    }
}

export default withRouter(BioSig);
