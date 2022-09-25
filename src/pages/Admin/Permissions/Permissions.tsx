import React, { Component } from 'react';
import { Route, RouteComponentProps, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import PermissionGroups from './PermissionGroups/PermissionGroups';
import PermissionList from './PermissionList/PermissionList';
import PermissionData from './PermissionData/PermissionData';
import { Api } from 'src/helpers/new';
import { Spinner } from 'src/components/Spinner';
import PermissionForm from './PermissionForm';
import PermissionContext from './PermissionsContext';
interface IConnectProps {
    pushBreadcrumbLink: (payload: any) => void;
    removeBreadcrumbLink: (payload: any) => void;
    setGlobalAlert: (payload: any) => void;
    createFormActions: (payload: any) => void;
}

interface IRouteProps {
    courseId: string;
}

interface IState {
    isLoading: boolean;
    permissionTypes: string[] | [];
    permissionLists: PermLists[] | [];
    selectedPermissionGroup: string | number;
    allPermissionGroups: [] | PermGroups[];
    defaultPermissionValues: [] | PermLists[];
    changedPermissionValues: [] | PermLists[];
    isDataChanged: boolean;
    defaultChecked: string[];
    showModal: boolean;
    selectedPermissionType: string | number;
    formModal: {
        warningMessage: string;
        confirmButtonText: string;
        cancelButtonText: string;
        confirmButtonAction: () => void;
        cancelButtonAction: () => void;
    };
}

export type PermLists = {
    _id: string;
    module: string;
    permissionsList: PermList[];
};

export type PermList = {
    _id: string;
    displayName: string;
    permission: string;
    severity: string;
    checked?: boolean;
};

export type PermGroups = {
    _id: string;
    deleted?: boolean;
    groupName: string;
    groupOrder: number;
    allPermissions: PermGroup[] | [];
    createdAt?: string;
    updatedAt?: string;
    isEditing?: boolean;
    userCount: number;
    isNew?: boolean;
};

export type PermGroup = {
    module: string;
    permissionsList: PermList[];
};

class Permissions extends Component<IConnectProps & RouteComponentProps<IRouteProps>, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isLoading: false,
            permissionTypes: [],
            permissionLists: [],
            selectedPermissionGroup: '',
            allPermissionGroups: [],
            defaultPermissionValues: [],
            defaultChecked: [],
            changedPermissionValues: [],
            isDataChanged: false,
            showModal: false,
            selectedPermissionType: '',
            formModal: {
                warningMessage: '',
                confirmButtonText: '',
                cancelButtonText: '',
                confirmButtonAction: () => {},
                cancelButtonAction: () => {},
            },
        };
        props.pushBreadcrumbLink({
            text: 'Permissions',
            path: '/admin/permissions',
        });
    }

    async componentDidMount() {
        this.setState({
            isLoading: true,
        });
        await this.fetchAllPermissionLists();
        await this.fetchAllPermissionGroups();
        this.setState({
            isLoading: false,
        });
    }

    componentWillUnmount() {
        this.props.removeBreadcrumbLink({
            text: 'Permissions',
            path: '/admin/permissions',
        });
    }

    setSelectedPermissionGroup = (id: number | string) => {
        this.setState({
            selectedPermissionGroup: id,
        });
    };

    fetchAllPermissionLists = async () => {
        const { success, response } = await Api.call('GET', '/permissions');

        if (success) {
            this.setState({
                permissionLists: response,
            });
        }
    };

    fetchAllPermissionGroups = async () => {
        const { success, response } = await Api.call('GET', '/permissions/groups');

        if (success) {
            this.setState({
                allPermissionGroups: response,
            });
        }

        return response;
    };

    handleChangedPermissionValues = (data: PermLists[]) => {
        this.setState({
            changedPermissionValues: [...data],
        });
    };

    handleDefaultChecked = (data: PermLists[]) => {
        this.setState({
            defaultChecked: data
                .map((perm) => perm.permissionsList.filter((list) => !!list.checked).map((list) => list._id))
                .flat(),
        });
    };

    checkIsDataChanged = () => {
        const oldPermissions: string[] = this.state.defaultChecked;
        const newPermissions: string[] = this.state.changedPermissionValues
            .map((perm) => perm.permissionsList.filter((list) => !!list.checked).map((list) => list._id))
            .flat();
        if (newPermissions.length === oldPermissions.length) {
            const dataChanged = [];
            for (const i in oldPermissions) {
                dataChanged.push(newPermissions.includes(oldPermissions[Number(i)]));
            }
            if (dataChanged.includes(false)) {
                this.setState({
                    isDataChanged: true,
                });
            } else {
                this.setState({
                    isDataChanged: false,
                });
            }
        } else {
            this.setState({
                isDataChanged: true,
            });
        }
    };

    handleShowModal = (value: boolean) => {
        this.setState({
            showModal: value,
        });
    };

    setFormModal = (obj: any) => {
        this.setState({
            formModal: {
                ...this.state.formModal,
                ...obj,
            },
        });
    };

    setSelectedPermissionType = (id: string | number) => {
        this.setState({
            selectedPermissionType: id,
        });
    };

    render() {
        return this.state.isLoading ? (
            <Spinner />
        ) : (
            <div className='permissions' style={{ scrollBehavior: 'smooth' }}>
                <PermissionContext.Provider
                    value={{
                        selectedPermissionType: this.state.selectedPermissionType,
                        allPermissionGroups: this.state.allPermissionGroups,
                        formModal: this.state.formModal,
                        selectedPermissionGroup: this.state.selectedPermissionGroup,
                        changedPermissionValues: this.state.changedPermissionValues,
                        isDataChanged: this.state.isDataChanged,
                        defaultChecked: this.state.defaultChecked,
                        showModal: this.state.showModal,
                        setSelectedPermissionType: this.setSelectedPermissionType,
                        setFormModal: this.setFormModal,
                        setSelectedPermissionGroup: this.setSelectedPermissionGroup,
                        handleChangedPermissionValues: this.handleChangedPermissionValues,
                        checkIsDataChanged: this.checkIsDataChanged,
                        handleDefaultChecked: this.handleDefaultChecked,
                        handleShowModal: this.handleShowModal,
                    }}
                >
                    <PermissionContext.Consumer>
                        {(permissionContext) => (
                            <>
                                <PermissionForm
                                    permissionContext={permissionContext}
                                    permissionLists={this.state.permissionLists}
                                />
                                <Row>
                                    <Col md={4}>
                                        <PermissionGroups
                                            permissionContext={permissionContext}
                                            allPermissionGroups={this.state.allPermissionGroups}
                                            fetchAllPermissionGroups={this.fetchAllPermissionGroups}
                                        />
                                        <PermissionList
                                            permissionContext={permissionContext}
                                            permissionLists={this.state.permissionLists}
                                        />
                                    </Col>
                                    <Col md={8}>
                                        <PermissionData
                                            permissionContext={permissionContext}
                                            permissionLists={this.state.permissionLists}
                                            selectedPermissionGroup={this.state.selectedPermissionGroup}
                                        />
                                    </Col>
                                </Row>
                            </>
                        )}
                    </PermissionContext.Consumer>
                </PermissionContext.Provider>
            </div>
        );
    }
}

export default connect(null, {
    pushBreadcrumbLink: (payload: any) => ({
        type: 'PUSH_BREADCRUMB_LINK',
        payload,
    }),
    removeBreadcrumbLink: (payload: any) => ({
        type: 'REMOVE_BREADCRUMB_LINK',
        payload,
    }),
})(Permissions);
