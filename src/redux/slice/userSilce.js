import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: {},
  semesters: [],
  classes: [],
  lectures: { users: [] },
  students: { users: [] },
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
    setAllAdminData: (state, action) => {
      return {
        ...state,
        ...action.payload,
        pending: false,
        error: null,
      };
    },
    addSemeter: (state, action) => {
      state.semesters = state.semesters.push(action.payload);
    },
    getSemesters(state, action) {
      state.semesters = action.payload;
    },
    setUserInfo(state, action) {
      state.userInfo = action.payload;
    },
    updateUserInfo(state, action) {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
    deleteSemester: (state, action) => {
      state.semesters = state.semesters.filter(
        (item) => item.semesterId !== action.payload
      );
    },
    getClasses: (state, action) => {
      state.classes = action.payload;
    },
    addClass: (state, action) => {
      state.classes = action.payload;
    },
    resetClasses: (state, action) => {
      state.classes = [];
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
  deleteSemester,
  getClasses,
  getLectures,
  getStudents,
  setPending,
  setError,
  addSemeter,
  resetClasses,
  setUserInfo,
  updateUserInfo,
  setAllAdminData,
  addClass
} = userSlice.actions;

export default userSlice.reducer;
