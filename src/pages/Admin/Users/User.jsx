import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import AffiliateTab from 'src/pages/Admin/Users/AffiliateTab';
import { ComponentTabs } from '../../../components/Tabs';
import apiCall from '../../../helpers/apiCall';
import './User.scss';
import UserMessages from './UserMessages';
import UserPackages from './UserPackages';
import UserProfile from './UserProfile';

class User extends Component {
    state = {
        user: null,
        modal: null,
    };

    tabs = [
        { tabTitle: 'Packages', TabComponent: UserPackages },
        { tabTitle: 'Profile', TabComponent: UserProfile },
        { tabTitle: 'Affiliate', TabComponent: AffiliateTab },
        { tabTitle: 'Messages', TabComponent: UserMessages },
    ];

    async componentDidMount() {
        const { success, response, message } = await apiCall('GET', '/users/' + this.props.match.params.id);

        if (success) {
            this.setState({
                user: response,
            });

            this.props.pushBreadcrumbLink({
                text: `${response.firstName} ${response.lastName} (${response.email})`,
                path: '/admin/users/' + this.props.match.params.id,
            });
            this.props.createFormActions({
                ...this.props.formActions.state,
                userActions: true,
                user: response,
            });
        } else {
            this.props.setGlobalAlert({ type: 'error', message });
        }
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: `${this.state.user.firstName} ${this.state.user.lastName} (${this.state.user.email})`,
            path: '/admin/users/' + this.props.match.params.id,
        });
        this.props.createFormActions({});
    }

    setUserModal = (modal) => {
        this.setState({
            modal,
        });
    };

    render() {
        if (this.state.user) {
            return (
                <div id='user-page'>
                    <ComponentTabs tabs={this.tabs} docId={this.props.match.params.id} user={this.state.user} />
                    {this.state.modal}
                </div>
            );
        }
        return <div />;
    }
}

export default connect(
    (state) => {
        return {
            formActions: state.formActions,
            loggedIn: state.loggedIn,
        };
    },
    {
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
        pushBreadcrumbLink: (payload) => ({
            type: 'PUSH_BREADCRUMB_LINK',
            payload,
        }),
        removeBreadcrumbLink: (payload) => ({
            type: 'REMOVE_BREADCRUMB_LINK',
            payload,
        }),
        createFormActions: (payload) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
    }
)(withRouter(User));
