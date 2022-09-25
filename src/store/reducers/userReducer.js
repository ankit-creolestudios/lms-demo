export const userInactive = (state = false, action) => {
    switch (action.type) {
        case 'SET_USER_INACTIVE':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const lastSeen = (state = 0, action) => {
    switch (action.type) {
        case 'SET_LAST_SEEN':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const inactivityType = (state = '', action) => {
    switch (action.type) {
        case 'SET_INACTIVITY_TYPE':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};
