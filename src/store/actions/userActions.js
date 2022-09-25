export const setUserInactive = (payload) => {
    return {
        type: 'SET_USER_INACTIVE',
        payload,
    };
};

export const setLastSeen = (payload) => {
    return {
        type: 'SET_LAST_SEEN',
        payload: Date.now(),
    };
};
export const setInactivityType = (payload) => {
    return {
        type: 'SET_INACTIVITY_TYPE',
        payload: payload,
    };
};
