import axios from 'axios';
import { setDocumentStart, setError } from '../redux/slice/documentSlice';

export const getAllDocument = async (classId) => {};

export const uploadDocument = async (classId, groupId, file, token, dispatch) => {
  try {
    if (!token) return dispatch(setError('Missing token!'));
    if (!file) return dispatch(setError('File is required!'));

    dispatch(setPending());

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'react_unsigned_upload');
    formData.append('cloud_name', 'dogkzlnvj');
    formData.append('resource_type', 'auto');

    // Send for Cloudinary
    const cloudRes = await axios.post(
      'https://api.cloudinary.com/v1_1/dogkzlnvj/auto/upload',
      formData,
    );

    const url = cloudRes.data.secure_url;
    const fileName = cloudRes.data.original_filename;
    const fileType = cloudRes.data.resource_type;
    const fileSize = cloudRes.data.bytes;

    // Send for Be
    const backendRes = await axios.post(
      `http://localhost:3000/documents`,
      {
        classId,
        groupId,
        url,
        name: fileName,
        type: fileType,
        size: fileSize,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    dispatch(addDocument(backendRes.data));

    return backendRes.data;
  } catch (e) {
    console.error('Something went wrong when upload:', e);
    dispatch(setError(e.response?.data?.message || e.message));
  }
};

export const getDocumentById = async (classId, groupId) => {};

export const deleteDocumentById = async (classId, groupId, documentId) => {};
