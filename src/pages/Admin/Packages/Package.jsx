import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { ComponentTabs } from '../../../components/Tabs';
import apiCall from '../../../helpers/apiCall';
import apiFile from '../../../helpers/apiFile';
import Bundles from './Bundles';
import Messages from './Messages';
import PackageContext from './PackageContext';
import PackageForm from './PackageForm';
import Taxes from './Taxes';
import Upsells from './Upsells';

class Package extends Component {
    constructor(props) {
        super(props);

        this.tabs = [{ tabTitle: 'Package', TabComponent: PackageForm }];

        if (props.match.params.id) {
            this.tabs = this.tabs.concat([
                { tabTitle: 'Bundles', TabComponent: Bundles },
                { tabTitle: 'Upsells', TabComponent: Upsells },
                { tabTitle: 'Taxes', TabComponent: Taxes },
                { tabTitle: 'Messages', TabComponent: Messages },
            ]);
        }
    }

    initialState = {
        loading: true,
        redirect: null,
        title: '',
        description: '',
        imageUrl: '',
        imageFile: '',
        publishDate: '',
        unpublishDate: '',
        availability: '',
        price: 365,
        taxType: 'FIXED',
        taxValue: '',
        courses: [],
        upsell: [],
        image: undefined,
        isDirty: false,
    };

    state = {
        ...this.initialState,
    };

    async componentDidMount() {
        await this.loadPackage();
        this.createBreadcrumbs();
    }

    componentWillUnmount() {
        this.removeBreadcrumbs();
    }

    async componentDidUpdate(prevProps) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.removeBreadcrumbs();
            await this.loadPackage();
            this.createBreadcrumbs();
        }
    }

    loadPackage = async () => {
        const { id: packageId } = this.props.match.params;

        if (packageId) {
            this.setState({
                loading: true,
            });

            const { success, response } = await apiCall('GET', `/packages/${packageId}?location=admin`);

            if (success) {
                const publishDate = response.publishDate ? response.publishDate.split('T')[0] : '',
                    unpublishDate = response.unpublishDate ? response.unpublishDate.split('T')[0] : '',
                    taxType = response.taxType ? response.taxType : 'FIXED';

                this.setState({
                    ...response,
                    imageUrl: await apiFile(response.image),
                    image: response.image,
                    publishDate,
                    unpublishDate,
                    taxType,
                    courses: response.courses.map((course) => ({
                        ...course,
                        draggableId: course.courseId,
                    })),
                    loading: false,
                    redirect: null,
                });
            }
        } else {
            this.setState({ loading: false });
        }
    };

    createBreadcrumbs = () => {
        this.props.pushBreadcrumbLink({
            text: 'Packages',
            path: '/admin/packages',
        });

        const { id: packageId } = this.props.match.params;

        if (packageId) {
            this.props.pushBreadcrumbLink({
                text: `Package: ${this.state.title}`,
                path: `/admin/packages/edit/${packageId}`,
            });
        }
    };

    removeBreadcrumbs = () => {
        this.props.removeBreadcrumbLink({
            text: 'Packages',
            path: '/admin/packages',
        });

        const { id: packageId } = this.props.match.params;

        if (packageId) {
            this.props.removeBreadcrumbLink({
                text: `Package: ${this.state.title}`,
                path: `/admin/packages/edit/${packageId}`,
            });
        }
    };

    setPackage = (state) => {
        this.setState(state);
    };

    render() {
        return (
            <PackageContext.Provider
                value={{
                    packageData: { ...this.state },
                    setPackage: this.setPackage,
                }}
            >
                <ComponentTabs tabs={this.tabs} docId={this.props.match.params.id} />
            </PackageContext.Provider>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(Package));
