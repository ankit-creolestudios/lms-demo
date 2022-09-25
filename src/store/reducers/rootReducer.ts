// import rootReducer from './rootReducer';

// export default rootReducer;

// This file combines all the reducers we create. This keeps the reducers structure organised.

import { combineReducers } from 'redux';

import { loggedIn } from './accountReducer';
import { globalAlert, globalBreadcrumb } from './globalReducer';
import {
    courseMenuOpen,
    updateCourseMenuLessons,
    showCourseMenu,
    updateCoursePercentage,
    unlockedLessons,
    completedLessons,
    quizPassedLessons,
} from './courseMenuReducer';
import {
    currentLesson,
    currentChapter,
    currentCourse,
    allLessons,
    allChapters,
    currentLessonCardIds,
    currentLessonLayout,
    newCoursePopUp,
} from './courseReducers';
import { coursePreview } from './adminReducer';
import { userInactive, lastSeen, inactivityType } from './userReducer';
import { formActions } from './formReducer';
import { examReminder } from './examReducer';

const rootReducer = combineReducers({
    loggedIn,
    globalAlert,
    globalBreadcrumb,
    currentLesson,
    currentChapter,
    currentCourse,
    showCourseMenu,
    newCoursePopUp,
    allLessons,
    allChapters,
    currentLessonCardIds,
    currentLessonLayout,
    courseMenuOpen,
    updateCourseMenuLessons,
    updateCoursePercentage,
    userInactive,
    lastSeen,
    inactivityType,
    unlockedLessons,
    completedLessons,
    quizPassedLessons,
    formActions,
    examReminder,
    coursePreview,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
