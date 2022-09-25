import React from 'react';

export default React.createContext({
    pageStatus: 'LOADING',
    lesson: null,
    chapter: {},
    course: {},
    cards: [],
    deletedCards: [],
    setGlobalAlert: () => null,
    handleLessonChange: () => null,
    updateDeletedCards: () => null,
    updatedCards: () => null,
});
