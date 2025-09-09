import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  pending: true,
  error: null,
  schedules: [],
};

const scheduleSlice = createSlice({
  name: "schedule",
  initialState: initialState,
  reducers: {
    getSchedules: (state, action) => {
      state.schedules = Array.isArray(action.payload)
        ? action.payload
        : [action.payload].filter(Boolean);
    },
    addSchedules: (state, action) => {
      if (Array.isArray(action.payload)) {
        state.schedules = state.schedules.concat(action.payload);
      } else if (action.payload) {
        state.schedules.push(action.payload);
      }
    },
    deleteSchedules: (state, action) => {
      // action.payload may be an id string/number or an object containing slotId/id
      const idToRemove =
        typeof action.payload === "string" || typeof action.payload === "number"
          ? action.payload
          : action.payload?.slotId || action.payload?.id;
      if (!idToRemove) return;
      state.schedules = state.schedules.filter(
        (s) => (s.slotId || s.id) != idToRemove
      );
    },
    updateSchedules: (state, action) => {
      // payload can be the updated slot object or array/object wrapper
      const payload = action.payload;
      const updated = Array.isArray(payload) ? payload : [payload];
      updated.forEach((u) => {
        if (!u) return;
        const idToUpdate = u.slotId || u.id;
        if (!idToUpdate) return;
        const idx = state.schedules.findIndex(
          (s) => (s.slotId || s.id) == idToUpdate
        );
        if (idx !== -1) {
          // merge changes
          state.schedules[idx] = { ...state.schedules[idx], ...u };
        } else {
          // if not found, append
          state.schedules.push(u);
        }
      });
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
