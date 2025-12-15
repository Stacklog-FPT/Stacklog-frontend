import api from "../axios";
import { REACT_API_URL } from "../api/apiConfig";
import {
  setPending,
  setError,
  addTasks,
  updateTaskAiGen,
} from "../redux/slice/taskSlice";

export async function postAiTask(
  title,
  payload,
  token,
  startDate,
  endDate,
  count
) {
  if (!title) throw new Error("title is required");

  // normalize base URL and ensure it contains the /api segment
  let base = String(REACT_API_URL).trim().replace(/\/+$/, "");

  // if '/api' isn't present as a trailing path segment, append it
  if (!/\/api(\/|$)/i.test(base)) {
    base = base + "/api";
  }

  const encodedTitle = encodeURIComponent(String(title));

  // Provide reasonable defaults if dates or count are not provided
  const now = new Date();
  const toYYYYMMDD = (d) => {
    try {
      const dt = new Date(d || now);
      return dt.toISOString().slice(0, 10);
    } catch (e) {
      return now.toISOString().slice(0, 10);
    }
  };

  const s = encodeURIComponent(toYYYYMMDD(startDate));
  const e = encodeURIComponent(toYYYYMMDD(endDate));
  const c = encodeURIComponent(
    Number.isFinite(Number(count)) ? String(Number(count)) : "1"
  );

  const url = `${base}/chat/ai/${encodedTitle}/${s}/${e}/${c}`;

  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return api.post(url, payload, { headers });
}

export async function postAiTaskAndDispatch({
  title,
  payload,
  token,
  dispatch,
  startDate,
  endDate,
  count,
}) {
  if (!dispatch || typeof dispatch !== "function") {
    throw new Error("dispatch function is required");
  }

  dispatch({ type: "ai/postTask/pending" });

  try {
    const res = await postAiTask(
      title,
      payload,
      token,
      startDate,
      endDate,
      count
    );
    dispatch({ type: "ai/postTask/fulfilled", payload: res.data });
    return res.data;
  } catch (err) {
    const payload = err.response?.data || err.message || "Unknown error";
    dispatch({ type: "ai/postTask/rejected", payload });
    throw err;
  }
}

export async function postSaveTaskList(token, groupId, tasks) {
  if (!groupId) throw new Error("groupId is required");
  if (!Array.isArray(tasks)) throw new Error("tasks must be an array");

  // Build URL exactly as requested by backend: /appi/task/task/saveAll?groupId={groupId}
  const url = `${REACT_API_URL}task/task/saveAll?groupId=${encodeURIComponent(
    groupId
  )}`;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return api.post(url, tasks, { headers });
}

export async function postSaveTaskListAndDispatch({
  token,
  groupId,
  tasks,
  dispatch,
}) {
  if (!dispatch || typeof dispatch !== "function") {
    throw new Error("dispatch function is required");
  }
  
  console.log("🔵 [AiService] Starting save tasks...");
  console.log("🔵 [AiService] Input tasks to save:", tasks);
  
  dispatch(setPending(true));
  try {
    const res = await postSaveTaskList(token, groupId, tasks);
    
    console.log("🟢 [AiService] API Response:", res);
    console.log("🟢 [AiService] Response data:", res.data);
    console.log("🟢 [AiService] Is response data an array?", Array.isArray(res.data));
    console.log("🟢 [AiService] Response data length:", Array.isArray(res.data) ? res.data.length : 'N/A');

    console.log("🟡 [AiService] Dispatching updateTaskAiGen with:", res.data);
    dispatch(updateTaskAiGen(res.data));
    dispatch(setPending(false));
    
    console.log("✅ [AiService] Save completed successfully");
    return res.data;
  } catch (err) {
    console.error("❌ [AiService] Save failed:", err);
    const errorMsg = err.response?.data || err.message || "Unknown error";
    dispatch(setError(errorMsg));
    dispatch(setPending(false));
    throw err;
  }
}

export default {
  postAiTask,
  postAiTaskAndDispatch,
  postSaveTaskList,
  postSaveTaskListAndDispatch,
};
