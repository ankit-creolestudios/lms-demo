import apiCall from '../../helpers/apiCall';

export const selectSong = (song) => {
    return {
        type: 'SONG_SELECTED',
        payload: song,
    };
};

export const setAllChapters = (courseId) => {
    return async (dispatch) => {
        const dispatchItems = (success) => {
            dispatch({ type: 'SET_ALL_CHAPTERS', payload: success });
            return success;
        };

        const { success, response } = await apiCall('GET', `/users/courses/${courseId}/chapters`);
        if (success) {
            return dispatchItems(response.chapters);
        }
        return dispatchItems([]);
    };
};

export const setAllLessons = (chapterId) => {
    return async (dispatch) => {
        const dispatchItems = (success) => {
            dispatch({ type: 'SET_ALL_LESSONS', payload: success });
            return success;
        };

        const { success, response } = await apiCall('GET', `/users/chapters/${chapterId}/lessons`);
        if (success) {
            return dispatchItems(response.docs);
        }
        return dispatchItems([]);
    };
};

export const setCurrentLessonsCardIds = (payload) => {
    return {
        type: 'SET_CURRENT_LESSON_CARD_IDS',
        payload,
    };
};

export const setCurrentLessonLayout = (payload) => {
    return {
        type: 'SET_CURRENT_LESSON_LAYOUT',
        payload,
    };
};

export const setUnlockedLessons = (payload) => {
    return {
        type: 'SET_UNLOCKED_LESSONS',
        payload,
    };
};

export const setCompletedLessons = (payload) => {
    return {
        type: 'SET_COMPLETED_LESSONS',
        payload,
    };
};

export const setQuizPassedLessons = (payload) => {
    return {
        type: 'SET_QUIZ_PASSED_LESSONS',
        payload,
    };
};

export const setCurrentLesson = (payload) => {
    return {
        type: 'SET_CURRENT_LESSON',
        payload,
    };
};

export const setCurrentCourse = (payload) => {
    return {
        type: 'SET_CURRENT_COURSE',
        payload,
    };
};

export const setCurrentChapter = (payload) => {
    return {
        type: 'SET_CURRENT_CHAPTER',
        payload,
    };
};

export const setNewCoursePopUp = (payload) => {
    return {
        type: 'SET_NEW_COURSE_POP_UP',
        payload,
    };
};
