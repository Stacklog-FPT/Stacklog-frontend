import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: null,
  scoreCategories: [],
};

const scoreSlice = createSlice({
  name: 'score',
  initialState: initialState,
  reducers: {
    getScoreStart(state) {
      state.pending = true;
      state.error = null;
    },

    getScoreSuccess(state, action) {
      state.pending = false;
      state.error = null;
      state.scoreCategories = action.payload;
    },

    getScoreFailure(state, action) {
      state.pending = false;
      state.error = action.payload || 'Load score categories failed';
    },
    // Generic API state reducers (used by service functions)
    apiStart(state) {
      state.pending = true;
      state.error = null;
    },
    apiSuccess(state) {
      state.pending = false;
      state.error = null;
    },
    apiFailure(state, action) {
      state.pending = false;
      state.error = action.payload || 'API request failed';
    },
  },
});

export const {
  getScoreStart,
  getScoreSuccess,
  getScoreFailure,
  apiStart,
  apiSuccess,
  apiFailure,
} = scoreSlice.actions;

export default scoreSlice.reducer;

export const selectScoreCategories = (s) => s.score?.scoreCategories;
