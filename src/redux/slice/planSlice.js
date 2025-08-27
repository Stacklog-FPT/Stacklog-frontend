import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pending: false,
  error: null,
  plans: [],
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlans: (state, action) => {
      state.plans = action.payload;
    },
    addPlan: (state, action) => {
      state.plans.push(action.payload);
    },
    updatePlan: (state, action) => {
      const { topicId } = action.payload;
      const idx = state.plans.findIndex((p) => p.topicId === topicId);
      if (idx !== -1) {
        state.plans[idx] = { ...state.plans[idx], ...action.payload };
      }
    },
    deletePlan: (state, action) => {
      state.plans = state.plans.filter((p) => p.topicId !== action.payload);
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetPlans: (state) => {
      state.plans = [];
    },
  },
});

export const {
  setPlans,
  addPlan,
  updatePlan,
  deletePlan,
  setPending,
  setError,
  resetPlans,
} = planSlice.actions;

export default planSlice.reducer;
