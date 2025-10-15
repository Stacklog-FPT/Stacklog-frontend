import axios from 'axios';
import { setPending, setError } from '../redux/slice/documentSlice';
import { REACT_API_URL } from '../api/apiConfig';
import { addDocument } from '../redux/slice/documentSlice';

// Port of BE
const DOCUMENT_API = REACT_API_URL + 'document';
export const getAllDocument = async (classId) => {};

export const uploadDocument = async (data, token, dispatch) => {
  try {
    if (!token) return dispatch(setError('Token is missing!'));
    if (!data.file) return dispatch(setError('File is required!'));

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

    console.log('Response for BE', responseForm);

    const backendRes = await axios.post(`${DOCUMENT_API}/save`, responseForm, {
      headers: { Authorization: `Bearer ${token}` },
    });

    dispatch(addDocument(backendRes.data));
    return backendRes;
  } catch (e) {
    console.error('Something went wrong when upload:', e);
    dispatch(setError(e.response?.data?.message || e.message));
  }
};

export const getDocumentById = async (classId, groupId) => {};

export const deleteDocumentById = async (classId, groupId, documentId) => {};
