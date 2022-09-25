export const courseMenuOpen = (state = false, action) => {
    switch (action.type) {
        case 'SET_COURSE_MENU_OPEN':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const showCourseMenu = (state = true, action) => {
    switch (action.type) {
        case 'SET_SHOW_COURSE_MENU':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const unlockedLessons = (state = { lessons: [] }, action) => {
    switch (action.type) {
        case 'SET_UNLOCKED_LESSONS':
            return {
                ...state,
                lessons: [...state.lessons, action.payload],
            };

        default:
            return state;
    }
};

export const completedLessons = (state = { lessons: [] }, action) => {
    switch (action.type) {
        case 'SET_COMPLETED_LESSONS':
            return {
                ...state,
                lessons: [...state.lessons, action.payload],
            };

        default:
            return state;
    }
};

export const quizPassedLessons = (state = { lessons: [] }, action) => {
    switch (action.type) {
        case 'SET_QUIZ_PASSED_LESSONS':
            return {
                ...state,
                lessons: [...state.lessons, action.payload],
            };

        default:
            return state;
    }
};

export const updateCourseMenuLessons = (state = '', action) => {
    switch (action.type) {
        case 'SET_UPDATE_COURSE_MENU_LESSONS':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const updateCoursePercentage = (state = false, action) => {
    switch (action.type) {
        case 'SET_UPDATE_COURSE_PERCENTAGE':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};
