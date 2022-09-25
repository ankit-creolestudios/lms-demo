import React from 'react';

type DiscountsNumericValueType = 'PERCENTAGE' | 'FIXED';
type DiscountsNumericValue = number | '';
type LoadingStatus = 'LOADING' | 'READY';

export interface DiscountsDetailsContext {
    name: string;
    defaultDiscountType: DiscountsNumericValueType;
    defaultDiscountValue: DiscountsNumericValue;
    defaultFixedCode: string;
    defaultCommissionType: DiscountsNumericValueType;
    defaultCommissionValue: DiscountsNumericValue;
    isEdited: boolean;
}

export interface DiscountsContext {
    status: LoadingStatus;
    details: DiscountsDetailsContext;
    packages: any;
    codes: any;
    setDetails: (details: Partial<DiscountsDetailsContext>) => void;
    setPackages: (packages: any) => void;
    setCodes: (codes: any) => void;
}

export default React.createContext<DiscountsContext>({
    status: 'LOADING',
    details: {
        name: '',
        defaultDiscountType: 'PERCENTAGE',
        defaultDiscountValue: '',
        defaultFixedCode: '',
        defaultCommissionType: 'PERCENTAGE',
        defaultCommissionValue: '',
        isEdited: false,
    },
    packages: [],
    codes: [],
    setDetails: (details: Partial<DiscountsDetailsContext>) => {},
    setPackages: (packages: any) => {},
    setCodes: (codes: any) => {},
});
