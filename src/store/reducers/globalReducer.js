/* Whatever needs to be */

export const globalAlert = (state = {}, action) => {
    switch (action.type) {
        case 'SET_GLOBAL_ALERT':
            return {
                ...action.payload,
                ts: Date.now(),
            };
        case 'UNSET_GLOBAL_ALERT':
            return null;
        default:
            return state;
    }
};

export const globalBreadcrumb = (state = {}, action) => {
    switch (action.type) {
        case 'PUSH_BREADCRUMB_LINK':
            return {
                ...state,
                [action.payload.path]: action.payload.text,
            };
        case 'REMOVE_BREADCRUMB_LINK':
            const { [action.payload.path]: remove, ...rest } = state;

            return rest;
        default:
            return state;
    }
};
