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
    deleteStatus: (state, action) => {
      state.statuses = state.statuses.filter((status) => status.statusTaskId !== action.payload);
    },
    updateStatus: (state, action) => {
      const status = state.statuses.find((s) => s.statusTaskId === action.payload.statusTaskId);
      if (status) {
        Object.assign(status, action.payload);
      }
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setStatus, setPending, setError, addStatus, deleteStatus, updateStatus } =
  statusSlice.actions;
export default statusSlice.reducer;
