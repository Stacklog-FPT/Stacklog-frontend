import axios from "axios";

import { apiStart, apiSuccess, apiFailure } from "../redux/slice/scoreSlice";
import { REACT_API_URL } from "../api/apiConfig";
const SCORE_API = REACT_API_URL + "score";

export const getScoreCategoriesByClass = async (classId, token, dispatch) => {
  if (!classId) throw new Error("Missing classId");
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/category/class/${classId}`;
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (dispatch) dispatch(apiSuccess(res.data));
    return res.data;
  } catch (err) {
    if (dispatch)
      dispatch(apiFailure(err.message || "Failed to load score categories"));
    throw err;
  }
};

export const saveScoreCategory = async (payload, token, dispatch) => {
  if (!payload) throw new Error("Missing payload");
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/category/save`;
    const res = await axios.post(url, payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });
    if (dispatch) dispatch(apiSuccess(res.data));
    return res.data;
  } catch (err) {
    if (dispatch)
      dispatch(apiFailure(err.message || "Failed to save score category"));
    throw err;
  }
};

export const updateScoreCategory = async (categoryId, updates = {}, token, dispatch) => {
  if (!categoryId) throw new Error('Missing categoryId');
  const payload = { ...updates, scoreCategoryId: categoryId };
  return await saveScoreCategory(payload, token, dispatch);
};

export const saveScore = async (payload, token, dispatch) => {
  if (!payload) throw new Error("Missing payload");
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/save`;
    const res = await axios.post(url, payload, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        : { "Content-Type": "application/json" },
    });
    if (dispatch) dispatch(apiSuccess(res.data));
    return res.data;
  } catch (err) {
    if (dispatch) dispatch(apiFailure(err.message || "Failed to save score"));
    throw err;
  }
};

export const getScoresByGroup = async (groupId, token, dispatch) => {
  if (!groupId) throw new Error("Missing groupId");
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/class/${groupId}`;
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (dispatch) dispatch(apiSuccess(res.data));
    return res.data;
  } catch (err) {
    if (dispatch)
      dispatch(apiFailure(err.message || "Failed to load scores by group"));
    throw err;
  }
};

export const getListScoreCategoryReuse = async ( token, dispatch) => {
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/category/isreuse`;
    const res = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (dispatch) dispatch(apiSuccess(res.data));
    return res.data;
  } catch (err) {
    if (dispatch) dispatch(apiFailure(err.message || 'Failed to check reuse'));
    throw err;
  }
};

export const deleteScoreCategory = async (categoryId, token, dispatch) => {
  if (!categoryId) throw new Error('Missing categoryId');
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/category/delete/${categoryId}`;
    const res = await axios.delete(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (dispatch) dispatch(apiSuccess(res.data));
    return res.data;
  } catch (err) {
    if (dispatch) dispatch(apiFailure(err.message || 'Failed to delete score category'));
    throw err;
  }
};

// Export scores as Excel by classId. Returns { arrayBuffer, filename, contentType }
export const exportScoreByClass = async (classId, token, dispatch) => {
  if (!classId) throw new Error('Missing classId');
  try {
    if (dispatch) dispatch(apiStart());
    const url = `${SCORE_API}/export-by-class?classId=${encodeURIComponent(classId)}`;
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // try extract filename from Content-Disposition header
    const contentDisp = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition']);
    let filename = 'export.xlsx';
    if (contentDisp) {
      const match = /filename\*=UTF-8''([^;\n\r]+)|filename="?([^";]+)"?/i.exec(contentDisp);
      if (match) {
        filename = decodeURIComponent(match[1] || match[2] || filename);
      }
    }

    const contentType = (res.headers && (res.headers['content-type'] || res.headers['Content-Type'])) || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (dispatch) dispatch(apiSuccess(res.data));
    return { arrayBuffer: res.data, filename, contentType };
  } catch (err) {
    if (dispatch) dispatch(apiFailure(err.message || 'Failed to export scores'));
    throw err;
  }
};

// Helper: save an ArrayBuffer as a downloadable file in the browser
export const saveArrayBufferAsFile = (arrayBuffer, filename = 'export.xlsx', contentType = 'application/octet-stream') => {
  try {
    const blob = new Blob([arrayBuffer], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    // fallback: try to open in new tab (may prompt download)
    console.warn('saveArrayBufferAsFile failed', e);
  }
};

// Convenience: export and trigger download
export const exportScoreAndDownload = async (classId, token, dispatch) => {
  const { arrayBuffer, filename, contentType } = await exportScoreByClass(classId, token, dispatch);
  saveArrayBufferAsFile(arrayBuffer, filename, contentType);
};

