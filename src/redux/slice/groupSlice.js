import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  pending: false,
  error: false,
  groups: [],
};

const groupSlice = createSlice({
  name: 'group',
  initialState: initialState,
  reducers: {
    getGroups: (state, action) => {
      state.groups = action.payload;
    },
  },
});
export const { getGroups } = groupSlice.actions;

export default groupSlice.reducer;
