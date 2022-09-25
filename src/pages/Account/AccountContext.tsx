import React from 'react';

export interface IAccountContext {
    notificationTabData: any;
    detailsTabData: any;
    failedToLoadMsg: string;
    fetchUserDetails: () => void;
}

export default React.createContext<IAccountContext>({
    notificationTabData: [],
    detailsTabData: {},
    failedToLoadMsg: '',
    fetchUserDetails: () => {},
});
