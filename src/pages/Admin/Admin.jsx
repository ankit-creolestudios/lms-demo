import './Admin.scss';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import AdminLayout from '../../layouts/Admin';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import { Users } from './Users';
import { Courses } from './Courses';
import { Packages } from './Packages';
import { CoreLibrary } from './CoreLibrary';
import { Quizzes } from './Quizzes';
import { Invoices } from './Invoices';
import { Settings } from './Settings';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Sessions } from './Sessions';
import UserActions from './Users/UserActions';
import { Button } from 'react-bootstrap';
import { ReportingRoutes } from './Reporting';
import Discounts from './Discounts';
import { Orders } from './Orders';
import { Permissions } from './Permissions';
import Notifications from '../Admin/Notifications/Notifications';

class Admin extends Component {
    handleCancel() {
        this.props.createFormActions({
            ...this.props.formActions.state,
            reload: true,
        });
    }

    handleSave() {
        this.props.createFormActions({
            ...this.props.formActions.state,
            save: true,
        });
    }

    getUsersPermissions = (name) =>
        JSON.parse(localStorage.getItem('user'))
            ?.userGroupPermissions?.allPermissions.find((data) => data.module === name)
            ?.permissionsList.map((list) => list.permission);

    render() {
        const breadcrumb = Object.keys(this.props.breadcrumb);
        return (
            <AdminLayout>
                <div className='admin-header'>
                    <ul id='breadcrumb'>
                        <li>
                            <Link to='/admin'>Dashboard</Link>
                            {breadcrumb && breadcrumb.length > 0 && <Fa icon={faChevronDown} />}
                        </li>
                        {breadcrumb.map((path, index) => {
                            return (
                                <li key={path}>
                                    <Link to={path}>{this.props.breadcrumb[path]}</Link>
                                    {index !== breadcrumb.length - 1 && <Fa icon={faChevronDown} />}
                                </li>
                            );
                        })}
                    </ul>
                    {this.props.formActions.state && (
                        <div className='admin-actions'>
                            {this.props.formActions.state.save ? (
                                <button
                                    className='btn bp'
                                    onClick={() => this.handleSave()}
                                    type='submit'
                                    form={this.props.formActions.state.id}
                                >
                                    Save
                                </button>
                            ) : null}

                            {this.props.formActions.state.cancel ? (
                                <button
                                    className='btn bd'
                                    type='button'
                                    form={this.props.formActions.state.id}
                                    onClick={() => this.handleCancel()}
                                >
                                    Cancel
                                </button>
                            ) : null}

                            {this.props.formActions.state.userActions ? (
                                <div>
                                    <UserActions
                                        verified={!!this.props.formActions.state.user.verified}
                                        suspended={!!this.props.formActions.state.user.suspended}
                                        userId={this.props.formActions.state.user._id}
                                    />
                                </div>
                            ) : null}

                            {this.props.formActions.state.customButtons ? (
                                this.props.formActions.state.customButtons.map((btnState, i) => {
                                    return (
                                        <Button
                                            disabled={btnState.disabled}
                                            as={btnState.link ? Link : undefined}
                                            to={btnState.link ? btnState.link : ''}
                                            key={`customButton-${i}`}
                                            className={`btn bd ${btnState.className}`}
                                            type='button'
                                            onClick={btnState.onClick}
                                        >
                                            {btnState.icon ? <Fa icon={btnState.icon} /> : btnState.label}
                                        </Button>
                                    );
                                })
                            ) : (
                                <></>
                            )}
                        </div>
                    )}
                </div>
                <div id='admin-content'>
                    <Switch>
                        <Route path='/admin/dashboard' component={Dashboard} />
                        <Route path='/admin/settings' component={Settings} />
                        <Route path='/admin/quizzes' component={Quizzes} />
                        <Route path='/admin/invoices' component={Invoices} />
                        <Route path='/admin/notifications' component={Notifications} />
                        {this.getUsersPermissions('sessions')?.includes('viewSessions') && (
                            <Route path='/admin/sessions' component={Sessions} />
                        )}
                        {this.getUsersPermissions('permissions')?.includes('viewPermissions') && (
                            <Route path='/admin/permissions' component={Permissions} />
                        )}
                        {this.getUsersPermissions('users')?.includes('viewUsers') && (
                            <Route path='/admin/users' component={Users} />
                        )}
                        {this.getUsersPermissions('courses')?.includes('viewCourses') && (
                            <Route path='/admin/courses' component={Courses} />
                        )}
                        {this.getUsersPermissions('packages')?.includes('viewPackages') && (
                            <Route path='/admin/packages' component={Packages} />
                        )}
                        {this.getUsersPermissions('coreLibrary')?.includes('viewCoreLibrary') && (
                            <Route path='/admin/core-library' component={CoreLibrary} />
                        )}
                        {this.getUsersPermissions('reporting')?.includes('viewReporting') && (
                            <Route path='/admin/reporting' component={ReportingRoutes} />
                        )}
                        {this.getUsersPermissions('discounts')?.includes('viewDiscounts') && (
                            <Route path='/admin/discounts' component={Discounts} />
                        )}
                        {this.getUsersPermissions('orders')?.includes('viewOrders') && (
                            <Route path='/admin/orders' component={Orders} />
                        )}
                        <Redirect exact from='/admin' to='/admin/dashboard' />
                    </Switch>
                </div>
            </AdminLayout>
        );
    }
}

export default connect(
    (state) => {
        return {
            loggedIn: state.loggedIn,
            breadcrumb: state.globalBreadcrumb,
            formActions: state.formActions,
        };
    },
    {
        setLoggedIn: (payload) => ({
            type: 'SET_LOGGED_IN',
            payload,
        }),
        pushBreadcrumbLink: (payload) => ({
            type: 'PUSH_BREADCRUMB_LINK',
            payload,
        }),
        createFormActions: (payload) => ({
            type: 'SET_FORM_ACTIONS',
            payload,
        }),
    }
)(Admin);
