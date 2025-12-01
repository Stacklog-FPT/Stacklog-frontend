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

export const createAvgGroupScore = async (classId, groupId, avgScore, token, dispatch) => {
  if (!groupId) throw new Error('Missing groupId');
  if (typeof avgScore === 'undefined' || avgScore === null) throw new Error('Missing avgScore');
  if (!classId) throw new Error('Missing classId');
  try {
    if (dispatch) dispatch(apiStart());
    const payload = { classId, groupId, avgScore };
    // Many backend implementations expect the params in the query string.
    // Include them in the URL (and still send a JSON body for compatibility).
    const url = `${SCORE_API}/create/avg-group-score?groupId=${encodeURIComponent(groupId)}&avgScore=${encodeURIComponent(avgScore)}&classId=${encodeURIComponent(classId)}`;
    // debug: log payload & url for easier server-side matching during failures
    try {
      // eslint-disable-next-line no-console
      console.debug('createAvgGroupScore - POST', url, payload);
    } catch (e) {}
    // Primary attempt: send JSON body (may trigger CORS preflight in browser)
    try {
      const res = await axios.post(url, payload, {
        headers: token
          ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
          : { 'Content-Type': 'application/json' },
      });
      if (dispatch) dispatch(apiSuccess(res.data));
      return res.data;
    } catch (errPrimary) {
      // If server returned 404 (or browser blocked due to CORS preflight), try fallbacks
      // Log primary error for diagnosis
      try {
        // eslint-disable-next-line no-console
        console.warn('createAvgGroupScore - primary JSON POST failed, will attempt fallbacks', errPrimary?.response?.status, errPrimary?.message);
      } catch (e) {}

      // Fallback 1: POST with empty body and no Content-Type (some servers expect query-only)
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        // eslint-disable-next-line no-console
        console.debug('createAvgGroupScore - fallback POST empty body', url, { headers });
        const res2 = await axios.post(url, null, { headers });
        if (dispatch) dispatch(apiSuccess(res2.data));
        return res2.data;
      } catch (errFallback1) {
        try {
          // eslint-disable-next-line no-console
          console.warn('createAvgGroupScore - fallback1 failed', errFallback1?.response?.status, errFallback1?.message);
        } catch (e) {}
        // Fallback 2: POST as application/x-www-form-urlencoded (may avoid preflight)
        try {
          const form = new URLSearchParams();
          form.append('classId', classId);
          form.append('groupId', groupId);
          form.append('avgScore', String(avgScore));
          const headers = token
            ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' }
            : { 'Content-Type': 'application/x-www-form-urlencoded' };
          // eslint-disable-next-line no-console
          console.debug('createAvgGroupScore - fallback POST form-urlencoded', url, form.toString());
          const res3 = await axios.post(url, form.toString(), { headers });
          if (dispatch) dispatch(apiSuccess(res3.data));
          return res3.data;
        } catch (errFallback2) {
          // all attempts failed; rethrow the original primary error to preserve details
          if (dispatch) dispatch(apiFailure(errPrimary.message || 'Failed to create avg group score'));
          throw errPrimary;
        }
      }
    }
    
  } catch (err) {
    if (dispatch) dispatch(apiFailure(err.message || 'Failed to create avg group score'));
    throw err;
  }
};

