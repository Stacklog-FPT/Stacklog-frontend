import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  pending: true,
  error: null,
  schedules: [],
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState: initialState,
  reducers: {
    getSchedules: (state, action) => {
      state.schedules = action.payload;
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { getSchedules, setPending, setError } = scheduleSlice.actions;

export default scheduleSlice.reducer;
