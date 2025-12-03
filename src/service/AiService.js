import api from "../axios";
import { REACT_API_URL } from "../api/apiConfig";

export async function postAiTask(title, payload, token) {
  if (!title) throw new Error("title is required");

  let base = String(REACT_API_URL).trim().replace(/\/+$/, "");

  if (!/\/api(?:$|\/)/i.test(base)) {
    base = base + "/api";
  }

  const encodedTitle = encodeURIComponent(title);
  const url = `${base}/chat/ai/${encodedTitle}`;

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return api.post(url, payload, { headers });
}


export async function postAiTaskAndDispatch({ title, payload, token, dispatch }) {
  if (!dispatch || typeof dispatch !== 'function') {
    throw new Error('dispatch function is required');
  }

  dispatch({ type: 'ai/postTask/pending' });

  try {
    const res = await postAiTask(title, payload, token);
    dispatch({ type: 'ai/postTask/fulfilled', payload: res.data });
    return res.data;
  } catch (err) {
    const payload = err.response?.data || err.message || 'Unknown error';
    dispatch({ type: 'ai/postTask/rejected', payload });
    throw err;
  }
}

export default { postAiTask, postAiTaskAndDispatch };
