import { configureStore } from '@reduxjs/toolkit';
import semesterReducer from './slice/semesterSlice';
const reducer = {
  semester: semesterReducer,
};

const store = configureStore({
  reducer: reducer,
});

export default store;
