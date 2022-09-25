import React, { Component, ReactNode } from 'react';
import { Api } from 'src/helpers/new';
import PackageCard, { IPackage } from './PackageCard';
import CourseCard from './CourseCard';
import './PackageList.scss';

interface Iprops {
    userId: string;
}
interface IState {
    packages: IPackage[];
}

export default class PackageList extends Component<Iprops, IState> {
    state: IState = {
        packages: [],
    };
    componentDidMount() {
        this.loadUserPackages();
    }

    loadUserPackages = async (): Promise<void> => {
        const { success, response } = await Api.call('get', `users/${this.props.userId}/packages`);
        if (success) {
            this.setState({
                packages: response.docs,
            });
        }
    };

    isSingleCourse = (userPackage: IPackage): boolean => {
        return userPackage.course !== null;
    };

    render(): ReactNode {
        const { packages } = this.state;

        return (
            <div className='package-list'>
                <h2>Your Courses</h2>
                {packages.map((userPackage: IPackage) => {
                    if (this.isSingleCourse(userPackage)) {
                        return (
                            <CourseCard
                                packageId={userPackage.packageId}
                                image={userPackage.data.image}
                                userCourse={userPackage.course}
                                key={userPackage._id}
                            />
                        );
                    } else {
                        return <PackageCard userPackage={userPackage} key={userPackage._id} />;
                    }
                })}
            </div>
        );
    }
}
