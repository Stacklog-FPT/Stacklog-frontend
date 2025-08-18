import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  statuses: [],
};

const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    setStatus: (state, action) => {
      state.statuses = action.payload;
    },
    addStatus: (state, action) => {
      state.statuses.push(action.payload);
    },
    deleteState: (state, action) => {
      state.statuses = state.statuses.filter((status) => status.statusTaskId !== action.payload);
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStatus, setPending, setError, addStatus, deleteState } = statusSlice.actions;
export default statusSlice.reducer;
