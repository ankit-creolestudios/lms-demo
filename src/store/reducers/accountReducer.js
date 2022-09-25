/*This file contains account related reducers I.E. whether the user is logged in or not*/

export const loggedIn = (state = {}, action) => {
    switch (action.type) {
        case 'SET_LOGGED_IN':
            return {
                ...action.payload,
            };
        default:
            return state;
    }
};
