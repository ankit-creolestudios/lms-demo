import React from 'react';
export interface IExamStatus {
    available: boolean;
    message: string;
}
interface IContext {
    course: any;
    unlockedLessons: string[];
    completedLessons: string[];
    examStatus?: IExamStatus;
    unlockLesson?: (lessonId: string) => void;
    completeLesson?: (lessonId: string) => void;
    unlockExam?: (unlockExam: IExamStatus) => void;
}

const context: IContext = {
    course: null,
    unlockedLessons: [],
    completedLessons: [],
};

export default React.createContext(context);
