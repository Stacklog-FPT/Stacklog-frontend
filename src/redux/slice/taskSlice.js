import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  tasks: [],
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
} = tasksSlice.actions;

export default tasksSlice.reducer;
