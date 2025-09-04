import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  semesters: [],
  classIdsBySemesterId: {},
  groupIdsByClassId: {},
  currentSemesterId: null,
  currentClassId: null,
  currentGroupId: null,
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
      state.currentGroupId = null;
    },
    selectClass(state, action) {
      state.currentClassId = action.payload ?? null;
      state.currentGroupId = null;
    },
    selectGroup(state, action) {
      state.currentGroupId = action.payload ?? null;
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
  selectGroup,
} = semesterSlice.actions;

export default semesterSlice.reducer;

/* ---------------------- SELECTORS ---------------------- */
const self = (s) => s.semester;

export const selectPending = (s) => self(s).pending;
export const selectError = (s) => self(s).error;

export const selectSemesters = (s) => self(s).semesters;
export const selectCurrentSemesterId = (s) => self(s).currentSemesterId;
export const selectCurrentClassId = (s) => self(s).currentClassId;
export const selectCurrentGroupId = (s) => self(s).currentGroupId;
