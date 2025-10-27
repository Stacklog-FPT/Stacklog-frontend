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
      state.documents = action.payload.filter((item) => item !== null);
      state.pending = false;
    },
    setDocumentPerson: (state, action) => {
      state.documentPerson = action.payload;
    },
    addDocument: (state, action) => {
      if (!Array.isArray(state.documents)) state.documents = [];
      state.documents.unshift(action.payload);
      state.pending = false;
    },
    addDocumentPerson: (state, action) => {
      state.documentPerson.push(action.payload);
      state.pending = false;
    },
    deleteDocument: (state, action) => {
      const documentId = action.payload;
      const getDocumentPerson = state.documentPerson.find((item) => item.documentId === documentId);
      console.log('Document Person has: ', getDocumentPerson);
      state.documents = state.documents.filter((item) => item.documentId !== documentId);
      if (getDocumentPerson) {
        state.documentPerson = state.documentPerson.filter(
          (item) => item.documentId !== documentId,
        );
      }
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
  deleteDocument,
  deleteDocumentPerson,
  addDocumentPerson,
} = documentSlice.actions;

export default documentSlice.reducer;
