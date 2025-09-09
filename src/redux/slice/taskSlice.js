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
      const { id, ...changes } = action.payload;
      const task = state.tasks.find((t) => t.id === id); // Change taskId before mockup with BE
      if (task) {
        Object.assign(task, changes);
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload); // Change taskId before mockup with BE
    },

    updateReview: (state, action) => {
      const { taskId, commentId, changes } = action.payload;

      const task = Array.isArray(state.tasks)
        ? state.tasks.find((t) => t.taskId === taskId)
        : state.tasks?.[taskId];

      if (!task) return;

      if (Array.isArray(changes?.reviews)) {
        const updatedReview = changes.reviews.find((rv) => rv.reviewId === commentId);
        if (!updatedReview) return;

        if (!Array.isArray(task.reviews)) task.reviews = [];

        const idx = task.reviews.findIndex((rv) => rv.reviewId === commentId);
        if (idx >= 0) {
          task.reviews[idx] = { ...task.reviews[idx], ...updatedReview };
        } else {
          // nếu chưa có, thêm mới (tùy yêu cầu)
          task.reviews.push(updatedReview);
        }
        return;
      }

      // 3) Còn nếu 'changes' chỉ là partial review fields -> merge trực tiếp
      if (!Array.isArray(task.reviews)) return;
      const review = task.reviews.find((rv) => rv.reviewId === commentId);
      if (!review) return;

      Object.assign(review, changes);
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
      state.tasks = [];
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
