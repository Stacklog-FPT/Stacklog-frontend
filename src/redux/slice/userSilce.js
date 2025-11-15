import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  semesters: [],
  classes: [],
  lectures: [],
  students: [],
  semesterDetail: {},
  classDetail: {},
  lectureDetail: {},
  studentDetail: {},
  pending: false,
  error: "",
};

const userSlice = createSlice({
  name: "users",
  initialState: initialState,
  reducers: {
    setPending(state, action) {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    getSemesters(state, action) {
      state.semesters = action.payload;
    },
    getClasses: (state, action) => {
      state.classes = action.payload;
    },
    getLectures: (state, action) => {
      state.lectures = action.payload;
    },
    addLecture: (state, action) => {
      state.lectures = state.lectures.push(action.payload);
    },
    getStudents: (state, action) => {
      state.students = action.payload;
    },
  },
});

export const {
  getSemesters,
  getClasses,
  getLectures,
  getStudents,
  setPending,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
