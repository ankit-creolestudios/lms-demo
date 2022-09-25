import React from 'react';
import { TableFilters } from './Notifications';

export interface ContextType {
    activeTab: number;
    setActiveTab: (n: number) => void;
    formOptions: any;
    broadCastForm: any;
    notificationForm: any;
    handleBroadcastForm: (key: string, value: string | number | boolean | any[]) => void;
    handleNotificationForm: (key: string, value: string | number | boolean | any[]) => void;
    selectedNotificationId: string;
    fetchNotificationData: () => void;
    setupForm: any;
    handleSetupForm: (key: string, value: string | number | boolean | any[]) => void;
    selectedMailingListId: string;
    fetchMailingListData: () => void;
    announcementDataLength: number;
    fetchAnnouncementDataLength: () => void;
    setAnnouncementDataLength: (value: number) => void;
    reloadTable: number;
    selectedBroadcastId: string;
    fetchBroadcastData: () => void;
    resetNotificationForm: () => void;
    resetBroadcastForm: () => void;
    resetSetupForm: () => void;
    tableFilters: TableFilters;
    setTableFilters: (tableName: string, key: string, value: string) => void;
    parameters: string[];
    updateNotificationState: (key: string, value: any) => void;
}

export default React.createContext<ContextType>({
    activeTab: 1,
    setActiveTab: (n: number) => {},
    formOptions: {},
    broadCastForm: {},
    notificationForm: {},
    handleBroadcastForm: (key: string, value: string | number | boolean | any[]) => {},
    handleNotificationForm: (key: string, value: string | number | boolean | any[]) => {},
    selectedNotificationId: '',
    fetchNotificationData: () => {},
    setupForm: {},
    handleSetupForm: (key: string, value: string | number | boolean | any[]) => {},
    selectedMailingListId: '',
    fetchMailingListData: () => {},
    announcementDataLength: 0,
    fetchAnnouncementDataLength: () => {},
    setAnnouncementDataLength: (value: number) => {},
    reloadTable: 0,
    selectedBroadcastId: '',
    fetchBroadcastData: () => {},
    resetNotificationForm: () => {},
    resetBroadcastForm: () => {},
    resetSetupForm: () => {},
    tableFilters: {
        notification: {
            condition: '',
            name: '',
            mailingListId: '',
        },
        broadcast: {
            name: '',
            mailingListId: '',
        },
    },
    setTableFilters: (tableName: string, key: string, value: string) => {},
    parameters: [
        '{{firstName}}',
        '{{lastName}}',
        '{{email}}',
        '{{phoneNumber}}',
        '{{addressLineOne}}',
        '{{addressLineTwo}}',
        '{{city}}',
        '{{state}}',
        '{{zipCode}}',
        '{{courseTitle}}',
        '{{completionDate}}',
        '{{examStatus}}',
        '{{examScore}}',
        '{{courseExpiresIn}}',
        '{{couseExpiresDate}}',
    ],
    updateNotificationState: (key: string, value: any) => {},
});
