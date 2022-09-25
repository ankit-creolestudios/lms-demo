export const setExamReminder = (courseId) => {
    return {
        // we need bolean here basically
        type: 'SET_EXAM_REMINDER',
        payload: courseId,
    };
};
