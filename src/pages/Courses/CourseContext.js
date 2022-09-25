import React from 'react';

export const CourseContext = React.createContext({
    data: null,
    unlockedLessons: [],
    completedLessons: [],
});
