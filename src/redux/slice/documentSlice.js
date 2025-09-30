import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: [],
  document: {},
  pending: false,
  error: null,
};

export const documentSlice = createSlice({
  name: 'document',
  initialState: initialState,
  reducers: {
    setPending: (state, action) => {
      state.pending = true;
    },
    setDocumentStart: (state, action) => {
      state.documents = action.payload;
    },
    getDocumentDetail: (state, action) => {
      state.document = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { setPending, setDocumentStart, getDocumentDetail, setError } = documentSlice.actions;

export default documentSlice.reducer;
