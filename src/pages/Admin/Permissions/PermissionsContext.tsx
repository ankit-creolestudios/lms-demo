import React from 'react';
import { PermGroups, PermList, PermLists } from './Permissions';

export interface ContextType {
    selectedPermissionType: string | number;
    allPermissionGroups: [] | PermGroups[];
    selectedPermissionGroup: string | number;
    changedPermissionValues: [] | PermLists[];
    isDataChanged: boolean;
    defaultChecked: string[] | [];
    showModal: boolean;
    formModal: {
        warningMessage: string;
        confirmButtonText: string;
        cancelButtonText: string;
        confirmButtonAction: () => void;
        cancelButtonAction: () => void;
    };
    setSelectedPermissionType: (id: string | number) => void;
    setFormModal: (obj: any) => void;
    setSelectedPermissionGroup: (id: string | number) => void;
    handleChangedPermissionValues: (data: PermLists[]) => void;
    checkIsDataChanged: () => void;
    handleDefaultChecked: (data: PermLists[]) => void;
    handleShowModal: (value: boolean) => void;
}

export default React.createContext<ContextType>({
    selectedPermissionType: '',
    allPermissionGroups: [],
    selectedPermissionGroup: '',
    changedPermissionValues: [],
    isDataChanged: false,
    defaultChecked: [],
    showModal: false,
    formModal: {
        warningMessage: '',
        confirmButtonText: '',
        cancelButtonText: '',
        confirmButtonAction: () => {},
        cancelButtonAction: () => {},
    },
    setSelectedPermissionType: (id: string | number) => {},
    setFormModal: (obj: any) => {},
    setSelectedPermissionGroup: (id: string | number) => {},
    handleChangedPermissionValues: (data: PermLists[]) => {},
    checkIsDataChanged: () => {},
    handleDefaultChecked: (data: PermLists[]) => {},
    handleShowModal: (value: boolean) => {},
});
