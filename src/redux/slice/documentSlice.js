import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  documents: [],
  documentPerson: [],
  documentDetail: {},
  pending: false,
  error: null,
};

export const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setPending: (state, action) => {
      state.pending = action.payload;
      state.error = null;
    },
    setDocuments: (state, action) => {
      state.documents = action.payload;
      state.pending = false;
    },
    setDocumentPerson: (state, action) => {
      state.documentPerson = action.payload;
    },
    addDocument: (state, action) => {
      state.documents.unshift(action.payload);
      state.pending = false;
    },
    getDocumentDetail: (state, action) => {
      state.documentDetail = action.payload;
      state.pending = false;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.pending = false;
    },
  },
});

export const {
  setPending,
  setDocuments,
  addDocument,
  getDocumentDetail,
  setError,
  setDocumentPerson,
} = documentSlice.actions;

export default documentSlice.reducer;
