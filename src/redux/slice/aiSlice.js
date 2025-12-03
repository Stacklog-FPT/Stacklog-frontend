import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AiService from '../../service/AiService';

const initialState = {
  pending: false,
  error: null,
  result: null,
};

// Async thunk to post AI task. Payload should be { title, payload, token }
export const postAiTask = createAsyncThunk(
  'ai/postTask',
  async ({ title, payload, token }, { rejectWithValue }) => {
    try {
      const res = await AiService.postAiTask(title, payload, token);
      return res.data;
    } catch (err) {
      // normalize error payload
      return rejectWithValue(err.response?.data || err.message || 'Unknown error');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
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
    clearResult(state) {
      state.result = null;
      state.error = null;
      state.pending = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(postAiTask.pending, (state) => {
        state.pending = true;
        state.error = null;
      })
      .addCase(postAiTask.fulfilled, (state, action) => {
        state.pending = false;
        state.error = null;
        state.result = action.payload;
      })
      .addCase(postAiTask.rejected, (state, action) => {
        state.pending = false;
        state.error = action.payload || action.error?.message || 'AI request failed';
      });
  }
});

export const { apiStart, apiSuccess, apiFailure, clearResult } = aiSlice.actions;

export default aiSlice.reducer;

export const selectAi = (s) => s.ai;
