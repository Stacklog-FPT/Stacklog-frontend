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
      state.documents = state.documents.filter((item) => item.documentId !== documentId);
      if (getDocumentPerson) {
        state.documentPerson = state.documentPerson.filter(
          (item) => item.documentId !== documentId,
        );
      }
      state.pending = false;
    },
    updateDocumentRedux: (state, action) => {
      const updatedDocument = action.payload;
      state.documents = state.documents.map((doc) => {
        if (doc.documentId === updatedDocument.documentId) {
          return {
            ...doc,
            ...(updatedDocument.documentTitle && { documentTitle: updatedDocument.documentTitle }),
            ...(updatedDocument.documentType && { documentType: updatedDocument.documentType }),
            ...(updatedDocument.documentPath && { documentPath: updatedDocument.documentPath }),
            ...(updatedDocument.documentSize && { documentSize: updatedDocument.documentSize }),
            ...(Array.isArray(updatedDocument.documentLocations) &&
            updatedDocument.documentLocations.length > 0
              ? { documentLocations: updatedDocument.documentLocations }
              : {}),
          };
        }
        return doc;
      });
    },

    updateDocumentPersonRedux: (state, action) => {
      const updatedDocument = action.payload;
      state.documentPerson = state.documentPerson.map((doc) => {
        if (doc.documentId === updatedDocument.documentId) {
          return {
            ...doc,
            ...(updatedDocument.documentTitle && { documentTitle: updatedDocument.documentTitle }),
            ...(updatedDocument.documentType && { documentType: updatedDocument.documentType }),
            ...(updatedDocument.documentPath && { documentPath: updatedDocument.documentPath }),
            ...(updatedDocument.documentSize && { documentSize: updatedDocument.documentSize }),
            ...(Array.isArray(updatedDocument.documentLocations) &&
            updatedDocument.documentLocations.length > 0
              ? { documentLocations: updatedDocument.documentLocations }
              : {}),
          };
        }
        return doc;
      });
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
  updateDocumentRedux,
  updateDocumentPersonRedux,
} = documentSlice.actions;

export default documentSlice.reducer;
