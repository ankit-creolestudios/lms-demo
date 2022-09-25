import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Api } from 'src/helpers/new';
import { PermGroups, PermLists } from './Permissions';
import { ContextType } from './PermissionsContext';

interface IState {}

interface IProps {
    setFormActions: (payload: any) => {
        type: string;
        payload: any;
    };
    setGlobalAlert: (payload: any) => {
        type: string;
        payload: any;
    };
    permissionContext: ContextType;
    permissionLists: [] | PermLists[];
}

class PermissionForm extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.setPageButtons();
    }

    componentDidUpdate(PrevProps: IProps) {
        if (this.props.permissionContext.isDataChanged !== PrevProps.permissionContext.isDataChanged) {
            this.setPageButtons();
        }
    }

    componentWillUnmount = () => {
        this.props.setFormActions({
            customButtons: [],
        });
    };

    setPageButtons = () => {
        const customButtons = [
            {
                label: 'Save',
                onClick: this.handleFormSave,
                disabled: !this.props.permissionContext.isDataChanged,
            },
            {
                label: 'Cancel',
                onClick: this.handleFormCancel,
                disabled: !this.props.permissionContext.isDataChanged,
            },
        ];
        this.props.setFormActions({
            customButtons,
        });
    };

    handleFormCancel = () => {
        this.props.permissionContext.handleShowModal(true);
        this.props.permissionContext.setFormModal({
            warningMessage: 'Are you sure you want to cancel?',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            confirmButtonAction: this.handleModalConfirm,
            cancelButtonAction: this.handleModalCancel,
        });
    };

    handleFormSave = async () => {
        const permissionGroupDetail = this.props.permissionContext.allPermissionGroups.find(
            (data) => data._id === this.props.permissionContext.selectedPermissionGroup
        );
        const { success, response, message } = await Api.call(
            'PATCH',
            `/permissions/group/edit/${this.props.permissionContext.selectedPermissionGroup}`,
            {
                groupName: permissionGroupDetail?.groupName,
                allowedPermissions: this.props.permissionContext.changedPermissionValues
                    .map((perm) => perm.permissionsList.filter((list) => !!list.checked).map((list) => list._id))
                    .flat(),
                groupOrder: permissionGroupDetail?.groupOrder,
            }
        );
        if (success) {
            const allPermissions: string[] = this.props.permissionContext.changedPermissionValues
                .map((perm) => perm.permissionsList.filter((list) => !!list.checked).map((list) => list._id))
                .flat();
            const permLists = this.props.permissionLists;
            for (const i in permLists) {
                const updatedPermissions = [];
                for (const j in permLists[Number(i)].permissionsList) {
                    const updatedPermission = {
                        ...permLists[Number(i)].permissionsList[Number(j)],
                        checked: allPermissions.includes(permLists[Number(i)].permissionsList[Number(j)]._id),
                    };
                    updatedPermissions.push(updatedPermission);
                }
                permLists.splice(Number(i), 1, {
                    ...permLists[Number(i)],
                    permissionsList: [...updatedPermissions],
                });
            }
            this.props.permissionContext.handleDefaultChecked([...permLists]);
            this.props.permissionContext.handleChangedPermissionValues([...permLists]);
            this.props.permissionContext.checkIsDataChanged();
            const localUserData = localStorage.getItem('user');
            if (
                localUserData &&
                this.props.permissionContext.selectedPermissionGroup ===
                    JSON.parse(localUserData)?.userGroupPermissions?._id
            ) {
                const { success, response } = await Api.call(
                    'GET',
                    `/permissions/group/${this.props.permissionContext.selectedPermissionGroup}`
                );
                const localUserObj = JSON.parse(localUserData);
                const newLocalData = {
                    ...localUserObj,
                    userGroupPermissions: {
                        ...localUserObj.userGroupPermissions,
                        allPermissions: response?.allPermissions,
                    },
                };
                localStorage.setItem('user', JSON.stringify(newLocalData));
                window.location.reload();
            }
            this.props.setGlobalAlert({
                type: 'success',
                message: message,
            });
        } else {
            this.props.setGlobalAlert({
                type: 'error',
                message: message,
            });
        }
    };

    handleModalCancel = () => {
        this.props.permissionContext.handleShowModal(false);
    };

    handleModalConfirm = () => {
        const allPermissions: string[] = this.props.permissionContext.defaultChecked;
        const permLists = this.props.permissionLists;
        for (const i in permLists) {
            const updatedPermissions = [];
            for (const j in permLists[Number(i)].permissionsList) {
                const updatedPermission = {
                    ...permLists[Number(i)].permissionsList[Number(j)],
                    checked: allPermissions.includes(permLists[Number(i)].permissionsList[Number(j)]._id),
                };
                updatedPermissions.push(updatedPermission);
            }
            permLists.splice(Number(i), 1, {
                ...permLists[Number(i)],
                permissionsList: [...updatedPermissions],
            });
        }
        this.props.permissionContext.handleShowModal(false);
        this.props.permissionContext.handleDefaultChecked([...permLists]);
        this.props.permissionContext.handleChangedPermissionValues([...permLists]);
        setTimeout(() => this.props.permissionContext.checkIsDataChanged(), 0);
    };

    render() {
        return (
            <Modal
                show={this.props.permissionContext.showModal}
                onHide={() => this.props.permissionContext.handleShowModal(false)}
            >
                <Modal.Body
                    onClick={(e: any) => {
                        e.stopPropagation();
                    }}
                >
                    {this.props.permissionContext.formModal.warningMessage}
                </Modal.Body>
                <Modal.Footer>
                    {this.props.permissionContext.formModal.confirmButtonText && (
                        <Button variant='primary' onClick={this.props.permissionContext.formModal.confirmButtonAction}>
                            {this.props.permissionContext.formModal.confirmButtonText}
                        </Button>
                    )}
                    {this.props.permissionContext.formModal.cancelButtonText && (
                        <Button variant='secondary' onClick={this.props.permissionContext.formModal.cancelButtonAction}>
                            {this.props.permissionContext.formModal.cancelButtonText}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        );
    }
}

export default connect(null, {
    setFormActions: (payload: any) => ({
        type: 'SET_FORM_ACTIONS',
        payload,
    }),
    setGlobalAlert: (payload: any) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(PermissionForm);
