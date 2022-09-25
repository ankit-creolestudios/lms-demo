import React, { Component } from 'react';
import { connect } from 'react-redux';
import { RootState } from 'src/store/reducers/rootReducer';
import { PackageList } from './packages';
import { withRouter, RouteComponentProps } from 'react-router';
import { Banner } from './Banner';
import './Home.scss';
import { UpsellsList } from './Upsells';

interface IConnectProps {
    loggedIn: any;
}

type TProps = RouteComponentProps<string, never> & IConnectProps;

interface IState {
    packages: any;
    packageCourses: any;
}

class Home extends Component<TProps, IState> {
    state: IState = {
        packages: null,
        packageCourses: null,
    };

    render() {
        const { loggedIn } = this.props;

        return (
            <div className='home'>
                <div className='banner-container'>
                    <Banner />
                </div>
                <div className='package-upsells'>
                    <PackageList userId={loggedIn.user._id} />
                    <UpsellsList userId={loggedIn.user._id} />
                </div>
            </div>
        );
    }
}

export default connect((state: RootState) => {
    return {
        loggedIn: state.loggedIn,
    };
})(withRouter(Home));
