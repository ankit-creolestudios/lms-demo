import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, ListGroup } from 'react-bootstrap';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './PermissionGroups.scss';
import { Api, EventBus } from 'src/helpers/new';
import { PermGroups } from '../Permissions';
import { ContextType } from '../PermissionsContext';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from '@reduxjs/toolkit';
import { Spinner } from 'src/components/Spinner';
import { getState } from 'src/helpers/localStorage';

interface IState {
    permissionGroupsData: [] | PermGroups[];
    inputVaues: {
        new: string;
        old: string;
    };
    isLoading: boolean;
}

type permissionGroupsData = {
    groupName: string;
    members: number;
    isEditing: boolean;
    id: number;
};

interface IProps extends RouteComponentProps {
    permissionContext: ContextType;
    allPermissionGroups: [] | PermGroups[];
    fetchAllPermissionGroups: () => Promise<void>;
    setGlobalAlert: (payload: any) => {
        type: string;
        payload: any;
    };
}

class PermissionGroups extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            inputVaues: {
                new: '',
                old: '',
            },
            isLoading: false,
            permissionGroupsData: this.props.allPermissionGroups,
        };
    }

    componentDidMount = () => {
        const allPermGroups = this.props.allPermissionGroups;
        for (const i in allPermGroups) {
            allPermGroups.splice(Number(i), 1, {
                ...allPermGroups[i],
                isEditing: false,
            });
        }
    };

    componentDidUpdate = (prevProps: IProps) => {
        if (
            prevProps.permissionContext.selectedPermissionGroup !== this.props.permissionContext.selectedPermissionGroup
        )
            this.setState({
                permissionGroupsData: this.props.allPermissionGroups,
            });
    };

    handleAddPermissionGroup = () => {
        if (this.props.permissionContext.isDataChanged) {
            this.props.permissionContext.setFormModal({
                warningMessage: 'Please save or cancel the changes before creating new Permission Group.',
                confirmButtonText: 'Ok',
                cancelButtonText: '',
                confirmButtonAction: () => this.props.permissionContext.handleShowModal(false),
                cancelButtonAction: () => {},
            });
            this.props.permissionContext.handleShowModal(true);
            return;
        }
        this.props.permissionContext.setSelectedPermissionGroup('');
        this.props.permissionContext.setSelectedPermissionType('');
        const editing = this.state.permissionGroupsData.map((data) => data.isEditing);
        if (editing.includes(true)) return;
        const newPermissionGroups: any = [...this.state.permissionGroupsData];
        newPermissionGroups.push({
            _id: new Date().getTime(),
            groupName: '',
            groupOrder: newPermissionGroups.length + getState('user')?.userGroupPermissions?.groupOrder,
            allPermissions: [],
            userCount: 0,
            isEditing: true,
            isNew: true,
        });
        setTimeout(() => {
            this.setState({
                inputVaues: {
                    new: '',
                    old: '',
                },
                permissionGroupsData: newPermissionGroups,
            });
        }, 0);
    };

    handleGroupEditing = (id: number | string, grpName: string) => {
        const editing = this.state.permissionGroupsData.map((data) => data.isEditing);
        if (editing.includes(true)) return;
        if (this.props.permissionContext.isDataChanged) {
            this.props.permissionContext.setFormModal({
                warningMessage: 'Please save or cancel the changes before editing Permission Group Name.',
                confirmButtonText: 'Ok',
                cancelButtonText: '',
                confirmButtonAction: () => this.props.permissionContext.handleShowModal(false),
                cancelButtonAction: () => {},
            });
            this.props.permissionContext.handleShowModal(true);
            return;
        }
        const newPermissionGroups = this.state.permissionGroupsData;
        const editIndex = newPermissionGroups.findIndex((grp) => grp._id === id);
        newPermissionGroups.splice(editIndex, 1, {
            ...newPermissionGroups[editIndex],
            isEditing: true,
        });
        this.setState({
            inputVaues: {
                new: grpName,
                old: grpName,
            },
            permissionGroupsData: newPermissionGroups,
        });
        setTimeout(() => {
            this.props.permissionContext.setSelectedPermissionGroup('');
            this.props.permissionContext.setSelectedPermissionType('');
        }, 0);
    };

    handleCloseEditing = (id: string) => {
        const newPermissionGroups = this.state.permissionGroupsData;
        const editIndex = newPermissionGroups.findIndex((grp) => grp._id === id);
        if (this.state.inputVaues.old === '') {
            newPermissionGroups.splice(editIndex, 1);
        } else {
            newPermissionGroups.splice(editIndex, 1, {
                ...newPermissionGroups[editIndex],
                isEditing: false,
                groupName: this.state.inputVaues.old,
            });
        }
        this.setState({
            inputVaues: {
                new: '',
                old: '',
            },
            permissionGroupsData: newPermissionGroups,
        });
        setTimeout(() => {
            this.props.permissionContext.setSelectedPermissionGroup('');
            this.props.permissionContext.setSelectedPermissionType('');
        }, 0);
    };

    handleInputChange = (e: any, id: string) => {
        const newPermissionGroups = this.state.permissionGroupsData;
        const editIndex = newPermissionGroups.findIndex((grp) => grp._id === id);
        newPermissionGroups.splice(editIndex, 1, {
            ...newPermissionGroups[editIndex],
            groupName: e.target.value,
        });
        this.setState({
            inputVaues: {
                ...this.state.inputVaues,
                new: e.target.value,
            },
            permissionGroupsData: newPermissionGroups,
        });
    };

    findGroup = (id: string | number) => {
        return this.state.permissionGroupsData.find((grp) => grp._id === id);
    };

    handleChangeGroupName = async (id: number | string, grpName: string) => {
        if (this.findGroup(id)?.isNew) {
            if (this.state.inputVaues.new !== this.state.inputVaues.old) {
                const { success, response, message } = await Api.call('POST', '/permissions/group/create', {
                    groupName: grpName,
                    allowedPermissions: [],
                    groupOrder: this.findGroup(id)?.groupOrder,
                });
                if (success) {
                    const newPermissionGroups = this.state.permissionGroupsData;
                    const editIndex = newPermissionGroups.findIndex((grp) => grp._id === id);
                    newPermissionGroups.splice(editIndex, 1, {
                        ...newPermissionGroups[editIndex],
                        groupName: grpName,
                        isEditing: false,
                        isNew: false,
                    });
                    this.setState({
                        inputVaues: {
                            new: '',
                            old: '',
                        },
                        permissionGroupsData: newPermissionGroups,
                    });
                    const response: any = await this.props.fetchAllPermissionGroups();
                    this.props.permissionContext.setSelectedPermissionGroup('');
                    this.props.permissionContext.setSelectedPermissionType('');
                    this.setState({
                        permissionGroupsData: response,
                    });
                    EventBus.dispatch('toast', {
                        type: 'success',
                        message,
                    });
                }
            }
        } else {
            const { success, response, message } = await Api.call(
                'PATCH',
                `/permissions/group/edit/${this.findGroup(id)?._id}`,
                {
                    groupName: grpName,
                    allowedPermissions: this.props.permissionContext.defaultChecked,
                    groupOrder: this.findGroup(id)?.groupOrder,
                }
            );
            if (success) {
                const allPermGroups: any = await this.props.fetchAllPermissionGroups();
                this.props.permissionContext.setSelectedPermissionGroup('');
                this.props.permissionContext.setSelectedPermissionType('');
                this.setState({
                    permissionGroupsData: allPermGroups,
                });
                EventBus.dispatch('toast', {
                    type: 'success',
                    message,
                });
            }
        }
    };

    handleDragEnd = async (e: any, id?: string) => {
        this.setState({
            isLoading: true,
        });
        const newPermissionGroupsData = [
            ...this.state.permissionGroupsData.sort((a, b) => {
                return a.groupOrder - b.groupOrder;
            }),
        ];
        const movedGroup = newPermissionGroupsData.splice(e.source.index, 1);
        newPermissionGroupsData.splice(e.destination.index, 0, movedGroup[0]);
        if (id !== '') {
            const deletedId = newPermissionGroupsData.findIndex((data) => data._id === id);
            newPermissionGroupsData.splice(deletedId, 1);
        }
        this.setState({
            permissionGroupsData: [...newPermissionGroupsData],
        });

        for (let i = 1; i <= newPermissionGroupsData.length; i++) {
            if (i !== newPermissionGroupsData[i - 1].groupOrder) {
                await Api.call('PATCH', `/permissions/group/edit/${newPermissionGroupsData[i - 1]._id}`, {
                    groupOrder: i,
                });
            }
        }
        const response: any = await this.props.fetchAllPermissionGroups();
        this.props.permissionContext.setSelectedPermissionType('');
        this.setState({
            permissionGroupsData: response,
            isLoading: false,
        });
    };

    handleSelectedPermissionGroupChange = (grp: PermGroups) => {
        if (this.props.permissionContext.isDataChanged) {
            this.props.permissionContext.setFormModal({
                warningMessage: 'Please save or cancel the changes before moving to another Permission Group.',
                confirmButtonText: 'Ok',
                cancelButtonText: '',
                confirmButtonAction: () => this.props.permissionContext.handleShowModal(false),
                cancelButtonAction: () => {},
            });
            this.props.permissionContext.handleShowModal(true);
            return;
        }
        this.props.permissionContext.setSelectedPermissionGroup(grp._id);
        this.props.permissionContext.setSelectedPermissionType('');
    };

    handleNavigate = (id: string) => {
        this.props.history.push('/admin/users', {
            permissionGroupId: id,
        });
    };

    handlePermissionGroupDelete = async (grp: PermGroups) => {
        if (grp.userCount > 0) {
            this.props.permissionContext.setFormModal({
                warningMessage:
                    'Please move all the Users to another Permission Group. Then only you can delete the Permission Group',
                confirmButtonText: 'Ok',
                cancelButtonText: '',
                confirmButtonAction: () => this.props.permissionContext.handleShowModal(false),
                cancelButtonAction: () => {},
            });
            this.props.permissionContext.handleShowModal(true);
            return;
        }
        this.setState({
            isLoading: true,
        });

        const { success, response, message } = await Api.call('DELETE', `/permissions/group/delete/${grp._id}`);

        if (success) {
            await this.props.fetchAllPermissionGroups();
            EventBus.dispatch('toast', {
                type: 'success',
                message,
            });
        }

        this.props.permissionContext.setSelectedPermissionGroup('');
        this.props.permissionContext.setSelectedPermissionType('');

        this.setState({
            isLoading: false,
        });
    };

    render() {
        return (
            <div className='permission-groups'>
                <h3>Permission Groups</h3>
                {this.state.isLoading ? (
                    <Spinner />
                ) : (
                    <div>
                        <DragDropContext
                            onDragStart={(e) => this.props.permissionContext.setSelectedPermissionGroup(e.draggableId)}
                            onDragEnd={(e) => this.handleDragEnd(e, '')}
                        >
                            <Droppable droppableId='droppable-permission-groups'>
                                {(provided) => (
                                    <>
                                        <ListGroup
                                            className='permission-group-list'
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            {this.state.permissionGroupsData
                                                .sort((a, b) => {
                                                    return a.groupOrder - b.groupOrder;
                                                })
                                                .map((grp, i) =>
                                                    grp.isEditing ? (
                                                        <ListGroup.Item
                                                            className={`permission-group-item ${
                                                                grp._id ===
                                                                    this.props.permissionContext
                                                                        .selectedPermissionGroup && 'active'
                                                            }`}
                                                        >
                                                            <input
                                                                style={{
                                                                    width: 'auto',
                                                                    padding: '0px 5px',
                                                                    flex: 1,
                                                                    minWidth: '80px',
                                                                }}
                                                                type='text'
                                                                id='title'
                                                                name='title'
                                                                value={grp.groupName}
                                                                onChange={(e) => this.handleInputChange(e, grp._id)}
                                                            />
                                                            <i
                                                                className='fa-solid fa-check'
                                                                onClick={() =>
                                                                    this.handleChangeGroupName(grp._id, grp.groupName)
                                                                }
                                                            ></i>
                                                            <i
                                                                className='fa-solid fa-xmark'
                                                                onClick={() => this.handleCloseEditing(grp._id)}
                                                            ></i>
                                                        </ListGroup.Item>
                                                    ) : (
                                                        <Draggable
                                                            key={`draggable-permission-groups-${grp._id}`}
                                                            draggableId={`${grp._id}`}
                                                            index={i}
                                                            isDragDisabled={this.props.permissionContext.isDataChanged}
                                                        >
                                                            {(provided) => (
                                                                <>
                                                                    <ListGroup.Item
                                                                        onClick={() =>
                                                                            this.handleSelectedPermissionGroupChange(
                                                                                grp
                                                                            )
                                                                        }
                                                                        className={`permission-group-item ${
                                                                            grp._id ===
                                                                                this.props.permissionContext
                                                                                    .selectedPermissionGroup && 'active'
                                                                        }`}
                                                                        ref={provided.innerRef}
                                                                        {...(!(
                                                                            grp.groupName === 'owners' ||
                                                                            grp.groupName === 'admin'
                                                                        )
                                                                            ? provided.draggableProps
                                                                            : {})}
                                                                    >
                                                                        <div className='permission-group-item-details'>
                                                                            <i
                                                                                className='fa-solid fa-bars'
                                                                                {...provided.dragHandleProps}
                                                                            ></i>
                                                                            <h6>
                                                                                {grp.groupName}{' '}
                                                                                <span
                                                                                    style={{
                                                                                        color:
                                                                                            grp.userCount > 0
                                                                                                ? 'blue'
                                                                                                : 'black',
                                                                                    }}
                                                                                    onClick={() => {
                                                                                        if (grp.userCount > 0) {
                                                                                            this.handleNavigate(
                                                                                                grp._id
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                >
                                                                                    ({grp.userCount})
                                                                                </span>
                                                                            </h6>
                                                                        </div>
                                                                        <div className='permission-group-item-actions'>
                                                                            <i
                                                                                className='fa-solid fa-pencil'
                                                                                onClick={(e) => {
                                                                                    this.handleGroupEditing(
                                                                                        grp._id,
                                                                                        grp.groupName
                                                                                    );
                                                                                }}
                                                                            ></i>
                                                                            {!(
                                                                                grp.groupName === 'owners' ||
                                                                                grp.groupName === 'admin'
                                                                            ) && (
                                                                                <i
                                                                                    className='fa-solid fa-trash-can'
                                                                                    onClick={(e) => {
                                                                                        this.handlePermissionGroupDelete(
                                                                                            grp
                                                                                        );
                                                                                    }}
                                                                                ></i>
                                                                            )}
                                                                        </div>
                                                                    </ListGroup.Item>
                                                                </>
                                                            )}
                                                        </Draggable>
                                                    )
                                                )}
                                        </ListGroup>
                                        {provided.placeholder}
                                    </>
                                )}
                            </Droppable>
                            <Button className='permission-group-add-button' onClick={this.handleAddPermissionGroup}>
                                <i className='fa-solid fa-square-plus'></i>
                                <h6>New Permission Group</h6>
                            </Button>
                        </DragDropContext>
                    </div>
                )}
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
    setGlobalAlert: (payload: any) => ({
        type: 'SET_GLOBAL_ALERT',
        payload,
    }),
})(withRouter(PermissionGroups));
