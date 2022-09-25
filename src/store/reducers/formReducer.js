export const formActions = (state = {}, action) => {
    switch (action.type) {
        case 'SET_FORM_ACTIONS':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};
