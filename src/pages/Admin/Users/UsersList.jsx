import React, { Component } from 'react';
import { ApiTable } from '../../../components/ApiTable';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Fa } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import apiCall from '../../../helpers/apiCall';
import { ConfirmationModal } from '../../../components/ConfirmationModal';
import { Link, withRouter } from 'react-router-dom';
import { Alert, Button, Col, Modal, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { checkEditing } from '../../../helpers/checkEditing.event';
import validator from 'validator';
import { Api, EventBus } from 'src/helpers/new';
import { startCase } from 'lodash';
import UsersPermissionGroupFilter from './UsersPermissionGroupFilter';
import UsersFullnameFilter from './UsersFullnameFilter';
import UsersEmailFilter from './UsersEmailFilter';
import { getState } from 'src/helpers/localStorage';
import { FaTimes } from 'react-icons/fa';

class UsersList extends Component {
    state = {
        toDelete: false,
        modalConfirmAction: null,
        showModalForm: false,
        modalFormMessage: '',
        firstName: '',
        lastName: '',
        email: '',
        emailCheck: '',
        permissionGroup: '',
        reloadTable: 0,
        allPermissionGroups: [],
        filterForm: {
            permissionGroupId: '',
            fullname: '',
            email: '',
            permissionGroupName: '',
        },
        filterQuery: '',
    };

    constructor(props) {
        super(props);

        props.pushBreadcrumbLink({
            text: 'Users',
            path: '/admin/users',
        });
    }

    componentDidMount = async () => {
        const { success, response } = await Api.call('GET', '/users/permission-groups/list');
        if (success) {
            this.setState({
                allPermissionGroups: response,
                filterForm: {
                    ...this.state.filterForm,
                    permissionGroupId: this?.props?.location?.state?.permissionGroupId ?? '',
                    permissionGroupName: this?.props?.location?.state?.permissionGroupId
                        ? startCase(
                              response.find((data) => data?._id === this?.props?.location?.state?.permissionGroupId)
                                  .groupName
                          )
                        : '',
                },
            });
        }
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (
            prevState.filterForm.permissionGroupId !== this.state.filterForm.permissionGroupId ||
            prevState.filterForm.fullname !== this.state.filterForm.fullname ||
            prevState.filterForm.email !== this.state.filterForm.email
        ) {
            this.setState({
                filterQuery: this.setFilterParams(),
            });
        }
    };

    setFilterForm = (obj) => {
        this.setState({
            filterForm: {
                ...this.state.filterForm,
                ...obj,
            },
        });
    };

    setFilterParams = () => {
        let filterParams = '';
        if (!!this.state.filterForm.permissionGroupId) {
            filterParams += `groupId=${this.state.filterForm.permissionGroupId}&`;
        }
        if (!!this.state.filterForm.fullname) {
            filterParams += `fullname=${this.state.filterForm.fullname}&`;
        }
        if (!!this.state.filterForm.email) {
            filterParams += `email=${this.state.filterForm.email}`;
        }
        return filterParams;
    };

    toggleShowModalForm = (e) => {
        if (e) {
            e.preventDefault();
        }

        this.setState({
            showModalForm: !this.state.showModalForm,
        });
    };

    handleFormSubmit = async () => {
        const { email, emailCheck } = this.state;

        if (!validator.isEmail(email)) {
            EventBus.dispatch('toast', {
                type: 'error',
                message: 'Enter valid e-mail address',
            });
            return;
        }

        if (email !== emailCheck) {
            EventBus.dispatch('toast', {
                type: 'error',
                message: 'E-mail address must match',
            });
            return;
        }

        await this.submitRegistrationForm();
    };

    submitRegistrationForm = async () => {
        let url = this.state.adminLevel === 0 ? '/users/admin/users/' : '/users/admin';

        const payload = {
            email: this.state.email.toLowerCase(),
            emailCheck: this.state.emailCheck.toLowerCase(),
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            permissionGroupId: this.state.permissionGroup,
        };

        if (this.state.adminLevel === 0) delete payload.permissionGroupId;

        const { success, message } = await Api.call('POST', url, payload);

        if (success) {
            EventBus.dispatch('toast', {
                type: 'success',
                message,
            });
            this.setState({
                showModalForm: !this.state.showModalForm,
                email: '',
                emailCheck: '',
                firstName: '',
                lastName: '',
                permissionGroup: '',
                reloadTable: success ? this.state.reloadTable + 1 : this.state.reloadTable,
            });
        }
    };

    handleInputChange = (e) => {
        const input = e.target;

        this.setState({
            [input.name]: input.value,
        });
    };

    unsetUserToDelete = () => {
        this.setState({
            toDelete: false,
        });
    };

    getGroupDetail = (id) => {
        return this.state.allPermissionGroups.find((data) => data._id === id);
    };

    handleResetFilter = (key) => {
        this.setState({
            filterForm: {
                ...this.state.filterForm,
                [key]: '',
            },
        });
    };

    render() {
        return (
            <div>
                <Row className='page-header padding'>
                    <Col>
                        <h3>Users</h3>
                    </Col>
                    <div className='page-controls'>
                        <Button
                            onClick={() => {
                                this.setState({
                                    adminLevel: 1,
                                });
                                this.toggleShowModalForm();
                            }}
                            className='bp'
                        >
                            Create new admin
                        </Button>
                    </div>
                    <div className='page-controls'>
                        <Button
                            onClick={() => {
                                this.setState({
                                    adminLevel: 0,
                                });
                                this.toggleShowModalForm();
                            }}
                            className='bd ml-1'
                        >
                            Create new student
                        </Button>
                    </div>
                </Row>
                <Row>
                    {Object.entries(this.state.filterForm).map(
                        (filterData) =>
                            filterData[0] !== 'permissionGroupName' &&
                            filterData[1] !== '' && (
                                <div
                                    key={filterData[0]}
                                    onClick={() => this.handleResetFilter(filterData[0])}
                                    style={{
                                        border: '1px solid',
                                        background: 'white',
                                        padding: '5px 8px',
                                        fontSize: '15px',
                                        margin: '0 0 10px 10px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span>{startCase(filterData[0])}:&nbsp;</span>
                                    <span>
                                        {filterData[0] === 'permissionGroupId'
                                            ? this.state.filterForm.permissionGroupName
                                            : filterData[1]}
                                    </span>
                                    &nbsp;
                                    <FaTimes />
                                </div>
                            )
                    )}
                </Row>
                <ApiTable
                    reload={this.state.reloadTable}
                    basePath='/admin/users'
                    noSearch={true}
                    apiCall={{
                        method: 'GET',
                        path: '/users',
                        params: `${window.location.search}&${this.state.filterQuery}`,
                    }}
                    columns={[
                        {
                            text: '',
                            field: (row) => {
                                const { editingAdmin } = row;
                                return (
                                    <OverlayTrigger
                                        placement='top'
                                        overlay={
                                            <Tooltip id={`tooltip-${row._id}-edit-course)}`}>
                                                {editingAdmin && editingAdmin?._id !== this.props.loggedIn?.user?._id
                                                    ? `${editingAdmin.firstName} ${editingAdmin.lastName} editing`
                                                    : 'Edit user'}
                                            </Tooltip>
                                        }
                                    >
                                        <Link
                                            onClick={(e) => {
                                                checkEditing(
                                                    e,
                                                    editingAdmin?._id &&
                                                        editingAdmin?._id !== this.props.loggedIn?.user?._id
                                                );
                                            }}
                                            className='btn btn--small'
                                            to={'/admin/users/' + row._id}
                                        >
                                            <Fa icon={faEdit} />
                                        </Link>
                                    </OverlayTrigger>
                                );
                            },
                            maxWidth: '3.11rem',
                        },
                        {
                            text: 'Full name',
                            field: (row) => `${row.firstName} ${row.lastName}`,
                            filter: () => (
                                <UsersFullnameFilter
                                    filterForm={this.state.filterForm}
                                    setFilterForm={this.setFilterForm}
                                />
                            ),
                        },
                        {
                            text: 'Email',
                            field: 'email',
                            filter: () => (
                                <UsersEmailFilter
                                    filterForm={this.state.filterForm}
                                    setFilterForm={this.setFilterForm}
                                />
                            ),
                        },
                        {
                            text: 'Permission Group',
                            field: (row) => {
                                return (
                                    <div>
                                        {row.userPermissionGroups?.groupName
                                            ? startCase(row?.userPermissionGroups?.groupName)
                                            : '-'}
                                    </div>
                                );
                            },
                            filter: () => (
                                <UsersPermissionGroupFilter
                                    filterForm={this.state.filterForm}
                                    allPermissionGroups={this.state.allPermissionGroups}
                                    setFilterForm={this.setFilterForm}
                                />
                            ),
                        },
                        {
                            text: 'Phone number',
                            field: 'phoneNumber',
                            sortKey: 'phoneNumber',
                        },
                        {
                            text: 'Address',
                            field: (row) => {
                                let address = row.addressLineOne;

                                if (row.addressLineTwo) {
                                    address += ` ${row.addressLineTwo}`;
                                }

                                if (row.townCity) {
                                    address += `, ${row.townCity}`;
                                }

                                if (row.zipCode) {
                                    address += ` ${row.zipCode}`;
                                }

                                if (row.state) {
                                    address += `, ${row.state}`;
                                }

                                return address;
                            },
                            minWidth: '35%',
                        },
                    ]}
                    rowButtons={[
                        {
                            text: 'Delete user',
                            icon: faTrash,
                            clickCallback: async (e, row, reloadTable) => {
                                this.setState({
                                    toDelete: row,
                                    modalConfirmAction: async () => {
                                        this.setState({
                                            toDelete: false,
                                        });

                                        const { success, message } = await Api.call('DELETE', '/users/' + row._id);

                                        if (success) {
                                            EventBus.dispatch('toast', {
                                                type: 'success',
                                                message,
                                            });
                                            await reloadTable();
                                        }
                                    },
                                });
                            },
                        },
                    ]}
                />
                <Modal size='lg' show={this.state.showModalForm} onHide={this.toggleShowModalForm}>
                    <Modal.Header closeButton>
                        <Modal.Title>Create new {this.state.adminLevel === 0 ? 'student' : 'admin'} user</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className='form'>
                            <div className='form__content'>
                                <form action='/'>
                                    <Row>
                                        <Col>
                                            <div className='form__field'>
                                                <label htmlFor='firstName'>First name</label>
                                                <input
                                                    type='text'
                                                    name='firstName'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.firstName}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='form__field'>
                                                <label htmlFor='lastName'>Last name</label>
                                                <input
                                                    type='text'
                                                    name='lastName'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.lastName}
                                                />
                                            </div>
                                        </Col>
                                        {this.state.adminLevel !== 0 ? (
                                            <Col xs={2}>
                                                <div className='form__field'>
                                                    <label htmlFor='permissionGroup'>Permission Groups</label>
                                                    <select
                                                        name='permissionGroup'
                                                        onChange={this.handleInputChange}
                                                        value={this.state.permissionGroup}
                                                    >
                                                        <option value='' selected disabled hidden>
                                                            Choose Option
                                                        </option>
                                                        {this.state.allPermissionGroups
                                                            .filter(
                                                                (data) =>
                                                                    data.groupOrder >=
                                                                    getState('user').userGroupPermissions?.groupOrder
                                                            )
                                                            .sort((a, b) => a.groupOrder - b.groupOrder)
                                                            .map((grp) => (
                                                                <option value={grp._id}>{grp.groupName}</option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </Col>
                                        ) : (
                                            <></>
                                        )}
                                    </Row>
                                    <Row>
                                        <Col>
                                            <div className='form__field'>
                                                <label htmlFor='email'>Email address</label>
                                                <input
                                                    type='text'
                                                    name='email'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.email}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className='form__field'>
                                                <label htmlFor='emailCheck'>Email address confirmation</label>
                                                <input
                                                    type='text'
                                                    name='emailCheck'
                                                    onChange={this.handleInputChange}
                                                    defaultValue={this.state.emailCheck}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </form>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleFormSubmit}>Create</Button>
                        <button className='btn bd' onClick={this.toggleShowModalForm}>
                            Cancel
                        </button>
                    </Modal.Footer>
                </Modal>
                <ConfirmationModal
                    show={this.state.toDelete !== false}
                    hideModal={this.unsetUserToDelete}
                    titleText={`Delete user ${
                        this.state.toDelete !== false
                            ? this.state.toDelete.firstName + ' ' + this.state.toDelete.lastName
                            : ''
                    } `}
                    bodyText="Are you sure you want to delete user's account?"
                    confirmAction={this.state.modalConfirmAction}
                />
            </div>
        );
    }
}

export default connect(({ loggedIn }) => ({ loggedIn }), {
    pushBreadcrumbLink: (payload) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
})(withRouter(UsersList));
