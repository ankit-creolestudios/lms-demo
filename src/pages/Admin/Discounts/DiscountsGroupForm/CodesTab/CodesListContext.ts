import React from 'react';

export interface ICodesListContext {
    codeSearch: string;
    generationGroupId: string;
    descriptionSearch: string;
    packageIds: string[];
    validAtFrom: string;
    validAtUntil: string;
    invalidAtFrom: string;
    invalidAtUntil: string;
    usage: '' | 'USED' | 'UNUSED';
    validInvalid: '' | 'VALID' | 'INVALID';
    setFilter: (state: any) => void;
}

export default React.createContext<ICodesListContext>({
    codeSearch: '',
    generationGroupId: '',
    descriptionSearch: '',
    packageIds: [],
    validAtFrom: '',
    validAtUntil: '',
    invalidAtFrom: '',
    invalidAtUntil: '',
    usage: '',
    validInvalid: '',
    setFilter: () => {},
});
