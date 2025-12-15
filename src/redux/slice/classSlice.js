import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pending: false,
  error: null,
  classes: [],
};

const classesSlice = createSlice({
  name: "class",
  initialState: initialState,
  reducers: {
    setPending: (state, action) => {
      state.pending = action.payload;
    },

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
      state.error = action.payload || "Load semesters failed";
    },
    // Generic API state reducers (used by service functions)
    apiStart(state) {
      state.pending = true;
      state.error = null;
    },

    updateClass: (state, aciton) => {
      const currentClass = state.classes.find(
        (c) => c.classesId === aciton.payload.classesId
      );

      if (currentClass) {
        Object.assign(currentClass, aciton.payload);
      }
    },
    apiSuccess(state) {
      state.pending = false;
      state.error = null;
    },
    apiFailure(state, action) {
      state.pending = false;
      state.error = action.payload || "API request failed";
    },
  },
});

export const {
  getClassesStart,
  getClassesSuccess,
  getClassesFailure,
  apiStart,
  apiSuccess,
  apiFailure,
  setPending,
  updateClass,
} = classesSlice.actions;

export default classesSlice.reducer;

export const selectClasses = (s) => s.classes;
