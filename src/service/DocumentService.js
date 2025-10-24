import axios from 'axios';
import { REACT_API_URL } from '../api/apiConfig';
import {
  addDocument,
  setDocuments,
  setError,
  setPending,
  setDocumentPerson,
  deleteDocument,
  deleteDocumentPerson,
  addDocumentPerson,
} from '../redux/slice/documentSlice';
import decodedToken from '../service/DecodeJwt';
// Port of BE
const DOCUMENT_API = REACT_API_URL + 'document';

export const uploadDocument = async (data, token, dispatch) => {
  try {
    if (!token) return dispatch(setError('Token is missing!'));
    if (!data.file) return dispatch(setError('File is required!'));
    const user = decodedToken(token);
    dispatch(setPending());

    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('upload_preset', 'StackLog');
    formData.append('cloud_name', 'dogkzlnvj');

    const fileType = data.file.type;
    let uploadUrl = '';
    if (fileType.startsWith('image/'))
      uploadUrl = 'https://api.cloudinary.com/v1_1/dogkzlnvj/image/upload';
    else if (fileType.startsWith('video/'))
      uploadUrl = 'https://api.cloudinary.com/v1_1/dogkzlnvj/video/upload';
    else uploadUrl = 'https://api.cloudinary.com/v1_1/dogkzlnvj/raw/upload';

    const cloudRes = await axios.post(uploadUrl, formData);
    const url = cloudRes.data.secure_url;
    // const fileName = cloudRes.data.original_filename;
    const resourceType = cloudRes.data.resource_type;
    const fileSize = cloudRes.data.bytes;

    const responseForm = {
      documentId: null,
      documentTitle: data.documentTitle,
      documentContentType: resourceType,
      documentSize: fileSize,
      documentType: data.documentType || 'NORMAL',
      documentPath: url,
      documentLocations: data.documentLocations,
    };

    console.log(responseForm);
    const backendRes = await axios.post(`${DOCUMENT_API}/save`, responseForm, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (backendRes.data.createdBy === user.id) {
      dispatch(addDocumentPerson(backendRes.data));
    }

    dispatch(addDocument(backendRes.data));
    return backendRes;
  } catch (e) {
    console.error('Something went wrong when upload:', e);
    dispatch(setError(e.response?.data?.message || e.message));
  }
};

export const uploadDocumentByGroup = async (data, token, dispatch) => {
  try {
    if (!token) return dispatch(setError('Token is missing!'));
    const user = decodedToken(token);
    if (!data.file) {
      dispatch(setPending());
      console.log('payload debug: ', data);
      const backendRes = await axios.post(`${DOCUMENT_API}/save`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (backendRes.data.createdBy === user.id) {
        dispatch(addDocumentPerson(backendRes.data));
      }

      dispatch(addDocument(backendRes.data));
    } else {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('upload_preset', 'StackLog');
      formData.append('cloud_name', 'dogkzlnvj');

      const fileType = data.file.type;
      let uploadUrl = '';
      if (fileType.startsWith('image/'))
        uploadUrl = 'https://api.cloudinary.com/v1_1/dogkzlnvj/image/upload';
      else if (fileType.startsWith('video/'))
        uploadUrl = 'https://api.cloudinary.com/v1_1/dogkzlnvj/video/upload';
      else uploadUrl = 'https://api.cloudinary.com/v1_1/dogkzlnvj/raw/upload';

      const cloudRes = await axios.post(uploadUrl, formData);
      const url = cloudRes.data.secure_url;
      // const fileName = cloudRes.data.original_filename;
      const resourceType = cloudRes.data.resource_type;
      const fileSize = cloudRes.data.bytes;

      const responseForm = {
        documentId: null,
        documentTitle: data.documentTitle,
        documentContentType: resourceType,
        documentSize: fileSize,
        documentType: data.documentType || 'NORMAL',
        documentPath: url,
        documentLocations: data.documentLocations,
      };

      const backendRes = await axios.post(`${DOCUMENT_API}/save`, responseForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (backendRes.data.createdBy === user.id) {
        dispatch(addDocumentPerson(backendRes.data));
      }

      dispatch(addDocument(backendRes.data));
    }
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export const getDocumentById = async (groupId, token, dispatch) => {
  try {
    if (!token) {
      dispatch(setError('Missing Token!'));
      return;
    }

    dispatch(setPending(true));
    const res = await axios.get(`${DOCUMENT_API}/groups/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Response data: ', res);
    dispatch(setDocuments(res.data || []));
    return res;
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export const getDocumentByUserId = async (token, dispatch) => {
  try {
    if (!token) dispatch(setError('Missing token!'));
    dispatch(setPending(true));
    const res = await axios.get(`${DOCUMENT_API}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(setDocumentPerson(res.data));
    return res.data;
  } catch (e) {
    console.error('Something went wrong: ', e.message);
    dispatch(setError(e.message));
  }
};

export const deleteDocumentApi = async (documentId, token, dispatch) => {
  try {
    if (!token) dispatch(setError('Missing token!'));

    dispatch(setPending(true));
    const res = await axios.delete(`${DOCUMENT_API}/delete/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(deleteDocument(documentId));
    dispatch(deleteDocumentPerson(documentId));
  } catch (e) {}
};

export const updateDocument = async (data, token, dispatch) => {
  try {
    if (!token) return dispatch(setError('The token is missing!'));

    const res = await axios.post(`${DOCUMENT_API}/save`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const documentsArray = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data.data)
      ? res.data.data
      : [res.data.data];

    dispatch(setDocuments(documentsArray));
  } catch (e) {
    dispatch(setError(e.message));
  }
};
