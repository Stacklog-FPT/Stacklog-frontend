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

