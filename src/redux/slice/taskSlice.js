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
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { getTasks, setPending, setError } = tasksSlice.actions;

export default tasksSlice.reducer;
