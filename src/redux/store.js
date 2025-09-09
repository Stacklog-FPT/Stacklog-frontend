import { configureStore, combineReducers } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import semesterReducer from './slice/semesterSlice';
import statusReducer from './slice/statusSlice';
import classesReducer from './slice/classSlice';
import groupReducer from './slice/groupSlice';
import taskReducer from './slice/taskSlice';
import scheduleReducer from './slice/scheduleSlice';
import planReducer from './slice/planSlice';
import notificationReducer from './slice/notificationSlice';

const rootReducer = combineReducers({
  semester: semesterReducer,
  class: classesReducer,
  status: statusReducer,
  group: groupReducer,
  task: taskReducer,
  schedule: scheduleReducer,
  plan: planReducer,
  notification: notificationReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['semester', 'class', 'status', 'group', 'task', 'plan', 'notification'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(logger),
});

export const persistor = persistStore(store);

export default store;
