import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pending: false,
  error: null,
  plans: [],
  deadlinePlan: {},
  plansGroup: [],
};

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    setPlans: (state, action) => {
      state.plans = action.payload;
    },
    setPlansGroup: (state, action) => {
      state.plansGroup = action.payload;
    },
    addPlan: (state, action) => {
      state.plans.push(action.payload);
    },
    addDeadlinePlan: (state, action) => {
      state.deadlinePlan = action.payload;
    },
    setDeadline: (state, action) => {
      state.deadlinePlan = action.payload;
    },
    updateDeadline: (state, action) => {
      state.deadlinePlan = { ...state.deadlinePlan, ...action.payload };
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
  addDeadlinePlan,
  setDeadline,
  updateDeadline,
  setPlansGroup,
} = planSlice.actions;

export default planSlice.reducer;
