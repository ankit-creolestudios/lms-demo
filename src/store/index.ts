import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import rootReducer from './reducers/rootReducer';

export const store = configureStore({
    reducer: rootReducer,
    middleware: [
        ...getDefaultMiddleware({
            serializableCheck: false,
        }),
    ],
});

export type RootState = ReturnType<typeof store.getState>;
