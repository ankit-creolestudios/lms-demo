export const currentCourse = (state = {}, action) => {
    switch (action.type) {
        case 'SET_CURRENT_COURSE':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const newCoursePopUp = (state = {}, action) => {
    switch (action.type) {
        case 'SET_NEW_COURSE_POP_UP':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const currentChapter = (state = {}, action) => {
    switch (action.type) {
        case 'SET_CURRENT_CHAPTER':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const currentLesson = (state = {}, action) => {
    switch (action.type) {
        case 'SET_CURRENT_LESSON':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const currentLessonLayout = (state = '', action) => {
    switch (action.type) {
        case 'SET_CURRENT_LESSON_LAYOUT':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const allChapters = (state = [], action) => {
    switch (action.type) {
        case 'SET_ALL_CHAPTERS':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const allLessons = (state = null, action) => {
    switch (action.type) {
        case 'SET_ALL_LESSONS':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};

export const currentLessonCardIds = (state = {}, action) => {
    switch (action.type) {
        case 'SET_CURRENT_LESSON_CARD_IDS':
            return {
                ...state,
                state: action.payload,
            };
        default:
            return state;
    }
};
