import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  repoInfo: null,
  loading: false,
  error: null,
  saveTokenStatus: 'idle', // idle | pending | fulfilled | rejected
  setupRepoStatus: 'idle', // idle | pending | fulfilled | rejected
};

const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    // Save Token actions
    saveTokenPending: (state) => {
      state.loading = true;
      state.error = null;
      state.saveTokenStatus = 'pending';
    },
    saveTokenFulfilled: (state, action) => {
      state.loading = false;
      state.token = action.payload.githubToken;
      state.saveTokenStatus = 'fulfilled';
      state.error = null;
    },
    saveTokenRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.saveTokenStatus = 'rejected';
    },

    // Setup Repo actions
    setupRepoPending: (state) => {
      state.loading = true;
      state.error = null;
      state.setupRepoStatus = 'pending';
    },
    setupRepoFulfilled: (state, action) => {
      state.loading = false;
      state.repoInfo = action.payload;
      state.setupRepoStatus = 'fulfilled';
      state.error = null;
    },
    setupRepoRejected: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.setupRepoStatus = 'rejected';
    },

    // Reset states
    resetGithubState: (state) => {
      state.loading = false;
      state.error = null;
      state.saveTokenStatus = 'idle';
      state.setupRepoStatus = 'idle';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  saveTokenPending,
  saveTokenFulfilled,
  saveTokenRejected,
  setupRepoPending,
  setupRepoFulfilled,
  setupRepoRejected,
  resetGithubState,
  clearError,
} = githubSlice.actions;

export default githubSlice.reducer;
