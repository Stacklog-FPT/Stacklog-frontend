import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import semesterReducer from './slice/semesterSlice';
import statusReducer from './slice/statusSlice';
import classesReducer from './slice/classSlice';
import groupReducer from './slice/groupSlice';
const reducer = {
  semester: semesterReducer,
  class: classesReducer,
  status: statusReducer,
  group: groupReducer,
};

const store = configureStore({
  reducer: reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
});

export default store;
