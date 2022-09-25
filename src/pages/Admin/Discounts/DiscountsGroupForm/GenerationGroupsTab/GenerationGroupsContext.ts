import React from 'react';

export interface IGenerationGroupsContext {
    descriptionSearch: string;
    packageIds: string[];
    validAtFrom: string;
    validAtUntil: string;
    invalidAtFrom: string;
    invalidAtUntil: string;
    setFilter: (state: any) => void;
}

export default React.createContext<IGenerationGroupsContext>({
    descriptionSearch: '',
    packageIds: [],
    validAtFrom: '',
    validAtUntil: '',
    invalidAtFrom: '',
    invalidAtUntil: '',
    setFilter: () => {},
});
