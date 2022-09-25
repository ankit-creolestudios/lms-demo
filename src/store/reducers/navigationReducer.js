export const adminTabReducer = (state = null, action) => {
    switch (action.type) {
        case 'SET_ADMIN_SUB_TAB':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const studentTabReducer = (state = null, action) => {
    switch (action.type) {
        case 'SET_STUDENT_SUB_TAB':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};
