import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  tasks: [],
  personalTask: {},
};

const tasksSlice = createSlice({
  name: 'task',
  initialState: initialState,
  reducers: {
    getTasks: (state, action) => {
      state.tasks = action.payload;
    },
    setTasks: (state, action) => {
      state.tasks = action.payload;
    },
    addTasks: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTasks: (state, action) => {
      const task = state.tasks.find((t) => t.taskId === action.payload.taskId);
      if (task) {
        Object.assign(task, action.payload);
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.taskId !== action.payload);
    },

    updateReview: (state, action) => {
      const { reviewId, taskId } = action.payload;
      const task = state.tasks.filter((t) => t.taskId === taskId);
      if (task) {
        const review = task?.reviews.find((rv) => rv.reviewId === reviewId);

        if (review) {
          Object.assign(review, action.payload);
        }
      }
    },
    getPersonalTask: (state, action) => {
      state.personalTask = action.payload;
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },

    resetTasks: (state, action) => {
      state.tasks = state.tasks;
    },
  },
});

export const {
  setTasks,
  getTasks,
  setPending,
  setError,
  deleteTask,
  addTasks,
  updateTasks,
  resetTasks,
  getPersonalTask,
  updateReview,
} = tasksSlice.actions;

export default tasksSlice.reducer;
