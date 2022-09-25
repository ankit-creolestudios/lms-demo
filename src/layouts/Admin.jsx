import './Admin.scss';
import React, { Component } from 'react';
import { Menu, MenuItem } from '../components/Menu';
import {
    faCogs,
    faBolt,
    faChartBar,
    faFileAlt,
    faGraduationCap,
    faShoppingCart,
    faFileInvoiceDollar,
    faTachometerAlt,
    faTasks,
    faUsers,
    faPercentage,
    faLock,
} from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import apiCall from '../helpers/apiCall';
import { faBell } from '@fortawesome/free-regular-svg-icons';

class Admin extends Component {
    resendEmail = async () => {
        const { success, message } = await apiCall('GET', '/users/verify/resend');

        this.props.setGlobalAlert({
            type: success ? 'success' : 'error',
            message,
        });
    };

    getUsersPermissions = (name) =>
        JSON.parse(localStorage.getItem('user'))
            ?.userGroupPermissions?.allPermissions.find((data) => data.module === name)
            ?.permissionsList.map((list) => list.permission);

    render() {
        const APP_VERSION = localStorage.getItem('APP_VERSION');
        return (
            <div className={'admin-layout'}>
                <Menu basePath='/admin'>
                    <MenuItem to='/dashboard' icon={faTachometerAlt}>
                        Dashboard
                    </MenuItem>
                    <MenuItem to='/settings' icon={faCogs}>
                        Settings
                    </MenuItem>
                    <MenuItem to='/notifications' icon={faBell}>
                        Notifications
                    </MenuItem>
                    <MenuItem to='/grading' icon={faBell}>
                        Grading
                    </MenuItem>
                    {this.getUsersPermissions('permissions')?.includes('viewPermissions') && (
                        <MenuItem to='/permissions' icon={faLock}>
                            Permissions
                        </MenuItem>
                    )}
                    {this.getUsersPermissions('sessions')?.includes('viewSessions') && (
                        <MenuItem to='/sessions' icon={faBolt}>
                            Sessions
                        </MenuItem>
                    )}
                    {this.getUsersPermissions('users')?.includes('viewUsers') && (
                        <MenuItem to='/users' icon={faUsers}>
                            Users
                        </MenuItem>
                    )}
                    <MenuItem to='/invoices' icon={faFileInvoiceDollar}>
                        Invoices
                    </MenuItem>
                    {this.getUsersPermissions('packages')?.includes('viewPackages') && (
                        <MenuItem to='/packages' icon={faShoppingCart}>
                            Packages
                        </MenuItem>
                    )}
                    {this.getUsersPermissions('discounts')?.includes('viewDiscounts') && (
                        <MenuItem to='/discounts' icon={faPercentage}>
                            Discounts
                        </MenuItem>
                    )}
                    {this.getUsersPermissions('courses')?.includes('viewCourses') && (
                        <MenuItem to='/courses' icon={faGraduationCap}>
                            Courses
                        </MenuItem>
                    )}
                    {this.getUsersPermissions('coreLibrary')?.includes('viewCoreLibrary') && (
                        <MenuItem to='/core-library' icon={faFileAlt}>
                            Core library
                        </MenuItem>
                    )}
                    <MenuItem to='/quizzes' icon={faTasks}>
                        Quizzes
                    </MenuItem>
                    {this.getUsersPermissions('reporting')?.includes('viewReporting') && (
                        <MenuItem to='/reporting' icon={faChartBar}>
                            Reporting
                        </MenuItem>
                    )}
                    {this.getUsersPermissions('orders')?.includes('viewOrders') && (
                        <MenuItem to='/orders' icon={faShoppingCart}>
                            Orders
                        </MenuItem>
                    )}
                    {APP_VERSION && (
                        <div className='app-version'>
                            <small>V{APP_VERSION}</small>
                        </div>
                    )}
                </Menu>

                <main id='mainContainerId'>
                    <div className='admin-wrapper'>{this.props.children}</div>
                </main>
            </div>
        );
    }
}

export default connect(
    (state) => {
        return {
            breadcrumbList: state.globalBreadcrumb,
            loggedIn: state.loggedIn,
        };
    },
    {
        setGlobalAlert: (payload) => ({
            type: 'SET_GLOBAL_ALERT',
            payload,
        }),
    }
)(Admin);
