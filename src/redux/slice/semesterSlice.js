import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  semesters: [],
  classIdsBySemesterId: {},
  groupIdsByClassId: {},
  currentSemesterId: null,
};

const semesterSlice = createSlice({
  name: 'semester',
  initialState,
  reducers: {
    getSemestersStart(state) {
      state.pending = true;
      state.error = null;
    },

    getSemestersSuccess(state, action) {
      state.pending = false;
      state.error = null;
      state.semesters = action.payload;
    },

    getSemestersFailure(state, action) {
      state.pending = false;
      state.error = action.payload || 'Load semesters failed';
    },

    selectSemester(state, action) {
      state.currentSemesterId = action.payload ?? null;
      state.currentClassId = null;
    },
    selectClass(state, action) {
      state.currentClassId = action.payload ?? null;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setError,
  getSemestersStart,
  getSemestersSuccess,
  getSemestersFailure,
  selectSemester,
  selectClass,
} = semesterSlice.actions;

export default semesterSlice.reducer;

/* ---------------------- SELECTORS ---------------------- */
const self = (s) => s.semester;

export const selectPending = (s) => self(s).pending;
export const selectError = (s) => self(s).error;

export const selectSemesters = (s) => self(s).semesters;
export const selectCurrentSemesterId = (s) => self(s).currentSemesterId;
