export const examReminder = (state = '', action) => {
    switch (action.type) {
        case 'SET_EXAM_REMINDER':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};
