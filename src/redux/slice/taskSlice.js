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
  },
});

export const { getTasks } = tasksSlice.actions;

export default tasksSlice.reducer;
