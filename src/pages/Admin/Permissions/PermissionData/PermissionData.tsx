import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Accordion, Button, ListGroup, Modal, useAccordionToggle } from 'react-bootstrap';
import './PermissionData.scss';
import { v4 as uuid } from 'uuid';
import { startCase, upperCase } from 'lodash';
import { ConfirmationModal } from 'src/components/ConfirmationModal';
import { PermList, PermLists } from '../Permissions';
import { faLaptopHouse } from '@fortawesome/free-solid-svg-icons';
import { Api } from 'src/helpers/new';
import { Spinner } from 'src/components/Spinner';
import { ContextType } from '../PermissionsContext';
import { getState } from 'src/helpers/localStorage';

type permissionData = {
    _id: string;
    moduleName: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    permissionsList: permissionsList[];
};

type permissionsList = {
    permission: string;
    severity: string;
    permissionId: string;
    checked: boolean;
};

interface IState {
    showModal: boolean;
    promiseInfo: any;
    isLoading: boolean;
    ownerGroupId: string;
}
interface IProps {
    permissionLists: PermLists[];
    selectedPermissionGroup: string | number;
    permissionContext: ContextType;
    handleDefaultPermissionValues: (data: PermLists[]) => void;
}
class PermissionData extends Component<IProps, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            showModal: false,
            promiseInfo: {},
            isLoading: false,
            ownerGroupId:
                this.props.permissionContext.allPermissionGroups.find((grp) => grp.groupOrder === 1)?._id ?? '',
        };
    }

    componentDidMount = async () => {
        this.setState({
            isLoading: true,
        });
        await this.fetchGroupPermissions();
        this.setState({
            isLoading: false,
        });
    };

    componentDidUpdate = async (prevProps: IProps, prevState: IState) => {
        if (prevProps.selectedPermissionGroup !== this.props.selectedPermissionGroup) {
            await this.fetchGroupPermissions();
        }
    };

    fetchGroupPermissions = async () => {
        if (this.props.selectedPermissionGroup) {
            this.setState({
                isLoading: true,
            });
            const { success, response } = await Api.call(
                'GET',
                `/permissions/group/${this.props.selectedPermissionGroup}`
            );
            if (success) {
                const allPermissions: string[] = response.allPermissions
                    .map((perm: any) => perm.permissionsList.map((list: any) => list._id))
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
            }
            this.setState({
                isLoading: false,
            });
        }
    };

    handlePermissionListCheck = async (e: any, prm: PermList, dataId: string) => {
        const checkedValue = e.target.checked;
        let response = 'confirm';
        if (prm.severity === 'warn' && checkedValue) {
            response = await this.handleShowModal();
        }
        if (response === 'confirm') {
            const newPermission = [...this.props.permissionContext.changedPermissionValues];
            const permissionDataIndex = this.props.permissionContext.changedPermissionValues.findIndex(
                (data) => data._id === dataId
            );
            const newPermissionData = newPermission[permissionDataIndex];
            const permissionListIndex = newPermissionData.permissionsList.findIndex((p) => p._id === prm._id);
            newPermissionData.permissionsList.splice(permissionListIndex, 1, {
                ...newPermissionData.permissionsList[permissionListIndex],
                checked: checkedValue,
            });

            newPermission.splice(permissionDataIndex, 1, newPermissionData);
            this.props.permissionContext.handleChangedPermissionValues([...newPermission]);
            this.props.permissionContext.checkIsDataChanged();
        } else return;
    };

    handleAllPermissionListCheck = async (e: any, data: PermLists) => {
        const checkedValue = e.target.checked;
        let response = 'confirm';
        if (checkedValue) {
            response = await this.handleShowModal();
        }
        if (response === 'confirm') {
            const newPermission = [...this.props.permissionContext.changedPermissionValues];
            const permissionDataIndex = this.props.permissionContext.changedPermissionValues.findIndex(
                (d) => d._id === data._id
            );
            const newPermissionData = newPermission[permissionDataIndex];
            for (let i = 0; i < newPermissionData.permissionsList.length; i++) {
                newPermissionData.permissionsList[i].checked = checkedValue;
            }
            newPermission.splice(permissionDataIndex, 1, newPermissionData);
            this.props.permissionContext.handleChangedPermissionValues([...newPermission]);
            this.props.permissionContext.checkIsDataChanged();
        }
    };

    handleShowModal = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            this.setState({
                promiseInfo: {
                    resolve,
                    reject,
                },
                showModal: true,
            });
        });
    };

    handleHideModal = () => {
        this.state.promiseInfo.reject('cancel');
        this.setState({
            showModal: false,
        });
    };

    handleModalConfirm = () => {
        this.state.promiseInfo.resolve('confirm');
        this.setState({
            showModal: false,
        });
    };

    findGroup = (id: string | number) => {
        return this.props.permissionContext.allPermissionGroups.find((grp) => grp._id === id);
    };

    render() {
        return this.state.isLoading ? (
            <Spinner />
        ) : (
            this.props.selectedPermissionGroup !== '' && (
                <div className='permission-data'>
                    <h3>
                        Permissions{' '}
                        <span>
                            (
                            {startCase(this.findGroup(this.props.permissionContext.selectedPermissionGroup)?.groupName)}
                            )
                        </span>
                    </h3>
                    {this.props.permissionContext.changedPermissionValues.length > 0 &&
                        this.props.permissionContext.changedPermissionValues.map((data) => (
                            <Accordion
                                className='permission-data-accordion'
                                id={`permission-${data?._id}`}
                                key={data?._id}
                            >
                                <Accordion.Toggle
                                    as='div'
                                    id={`permission-toggle-${data?._id}`}
                                    eventKey={data._id}
                                    className='permission-data-accordion-toggle'
                                >
                                    <div>
                                        <input
                                            style={{
                                                margin: '4px 0 0 20px',
                                            }}
                                            type='checkbox'
                                            name={`permission-${data._id}`}
                                            checked={!data.permissionsList.map((data) => data.checked).includes(false)}
                                            data-id={data._id}
                                            disabled={
                                                this.state.ownerGroupId ===
                                                    this.props.permissionContext.selectedPermissionGroup ||
                                                getState('user').userGroupPermissions._id ===
                                                    this.props.permissionContext.selectedPermissionGroup
                                            }
                                            onChange={(e) => this.handleAllPermissionListCheck(e, data)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div className='accordion-header-title'>{data.module}</div>
                                </Accordion.Toggle>
                                <Accordion.Collapse
                                    id={`permission-collapse-${data?._id}`}
                                    eventKey={data._id}
                                    className='permission-data-accordion-collapse'
                                >
                                    <>
                                        {data?.permissionsList.map((prm) => (
                                            <div key={prm._id} className='accordion-body-permission'>
                                                <div>
                                                    <input
                                                        style={{
                                                            margin: '4px 0 0 20px',
                                                        }}
                                                        type='checkbox'
                                                        checked={prm.checked}
                                                        name={`permission-list-${prm._id}`}
                                                        onChange={(e) =>
                                                            this.handlePermissionListCheck(e, prm, data._id)
                                                        }
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={
                                                            this.state.ownerGroupId ===
                                                                this.props.permissionContext.selectedPermissionGroup ||
                                                            getState('user').userGroupPermissions._id ===
                                                                this.props.permissionContext.selectedPermissionGroup
                                                        }
                                                    />
                                                </div>
                                                <div
                                                    className={`accordion-body-permission-title ${
                                                        prm.severity === 'warn' && 'severity-warn'
                                                    }`}
                                                >
                                                    {startCase(prm.displayName)}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                </Accordion.Collapse>
                            </Accordion>
                        ))}
                    <Modal
                        style={{ justifyContent: 'center' }}
                        dialogClassName='permission-modal-container'
                        contentClassName='permission-modal-content'
                        show={this.state.showModal}
                        onHide={this.handleHideModal}
                        fullscreen={'md-down'}
                    >
                        <Modal.Body>{`Some of the permissions you are assigning to ${upperCase(
                            this.findGroup(this.props.permissionContext.selectedPermissionGroup)?.groupName
                        )} are powerful. These may allow access to sensitive data, deletion of important data, and have the ability to affect changes at scale.`}</Modal.Body>
                        <Modal.Footer>
                            <Button variant='primary' onClick={this.handleModalConfirm}>
                                Confirm
                            </Button>
                            <Button variant='secondary' onClick={this.handleHideModal}>
                                Cancel
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            )
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
})(PermissionData);
