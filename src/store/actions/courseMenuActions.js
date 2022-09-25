export const setShowCourseMenu = (payload) => {
    return {
        type: 'SET_SHOW_COURSE_MENU',
        payload: payload,
    };
};

export const setCourseMenuOpen = (payload) => {
    return {
        type: 'SET_COURSE_MENU_OPEN',
        payload: payload,
    };
};

export const setUpdateCourseMenuLessons = (payload) => {
    return {
        type: 'SET_UPDATE_COURSE_MENU_LESSONS',
        payload: payload,
    };
};

export const setUpdateCoursePercentage = (payload) => {
    return {
        type: 'SET_UPDATE_COURSE_PERCENTAGE',
        payload: payload,
    };
};
