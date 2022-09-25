export const coursePreview = (state = {}, action) => {
    switch (action.type) {
        case 'SET_PREVIEW_COURSE': {
            const newState = Object.assign({}, state, action.payload);

            return newState;
        }
        default:
            return state;
    }
};
