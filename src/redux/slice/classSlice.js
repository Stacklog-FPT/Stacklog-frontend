import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  classes: [],
};

const classesSlice = createSlice({
  name: 'class',
  initialState: initialState,
  reducers: {
    getClassesStart(state) {
      state.pending = true;
      state.error = null;
    },

    getClassesSuccess(state, action) {
      state.pending = false;
      state.error = null;
      state.classes = action.payload;
    },

    getClassesFailure(state, action) {
      state.pending = false;
      state.error = action.payload || 'Load semesters failed';
    },
  },
});

export const { getClassesStart, getClassesSuccess, getClassesFailure } = classesSlice.actions;

export default classesSlice.reducer;

export const selectClasses = (s) => s.classes;
