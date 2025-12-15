import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pending: false,
  error: null,
  tasks: [],
  personalTask: {},
};

const tasksSlice = createSlice({
  name: "task",
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
      const { taskId, commentId, changes } = action.payload;

      const task = Array.isArray(state.tasks)
        ? state.tasks.find((t) => t.taskId === taskId)
        : state.tasks?.[taskId];

      if (!task) return;

      if (Array.isArray(changes?.reviews)) {
        const updatedReview = changes.reviews.find(
          (rv) => rv.reviewId === commentId
        );
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
      state.tasks = state.tasks;
    },
    updateTaskAiGen: (state, action) => {
      console.log("🟣 [taskSlice] updateTaskAiGen called");
      console.log("🟣 [taskSlice] Current tasks count:", state.tasks.length);
      console.log("🟣 [taskSlice] Current tasks:", state.tasks);
      console.log("🟣 [taskSlice] Received payload:", action.payload);
      console.log("🟣 [taskSlice] Is payload an array?", Array.isArray(action.payload));
      
      if (Array.isArray(action.payload)) {
        console.log("🟣 [taskSlice] Spreading array payload, length:", action.payload.length);
        state.tasks = [...state.tasks, ...action.payload];
      } else {
        console.log("🟣 [taskSlice] Adding single task");
        state.tasks = [...state.tasks, action.payload];
      }
      
      console.log("🟣 [taskSlice] New tasks count:", state.tasks.length);
      console.log("🟣 [taskSlice] New tasks:", state.tasks);
      console.log("✅ [taskSlice] updateTaskAiGen completed");
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
  updateTaskAiGen,
} = tasksSlice.actions;

export default tasksSlice.reducer;
