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
    addSchedules: (state, action) => {
      state.schedules.push(action.payload);
    },
    deleteSchedules: (state, action) => {
      state.schedules = state.schedules.filter((s) => s.id !== action.payload); // Change slotId before mockup with BE
    },
    updateSchedules: (state, action) => {
      const { id, ...changes } = action.payload;
      const schedule = state.schedules.find((s) => s.id === id); // Change slotId before mockup with BE
      if (schedule) {
        Object.assign(schedule, changes);
      }
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetSchedule: (state, action) => {
      state.schedules = [];
    },
  },
});

export const {
  getSchedules,
  setPending,
  setError,
  resetSchedule,
  addSchedules,
  deleteSchedules,
  updateSchedules,
} = scheduleSlice.actions;

export default scheduleSlice.reducer;
