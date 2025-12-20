import axios from "axios";

import {
  setPending,
  setError,
  setPlans,
  updatePlan,
  addPlan,
  deletePlan,
  addDeadlinePlan,
  updateDeadline,
  setDeadline,
  setPlansGroup,
} from "../redux/slice/planSlice";
import { REACT_API_URL } from "../api/apiConfig";

export const getPlansApi = async (dispatch, token, classId) => {
  if (!classId) {
    return [];
  }
  try {
    dispatch(setPending(true));
    const url = `${REACT_API_URL}topic/class/${classId}`;
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    console.log("Get Plan Api: ", response);

    // API returns array of PI items. Map to the frontend's topic shape.
    // API may return either an array or a single object. Normalize to array.
    let data = [];
    if (Array.isArray(response.data)) data = response.data;
    else if (response.data && typeof response.data === "object")
      data = [response.data];
    const mapped = data.map((p) => ({
      topicId: p.piId || p.id || "",
      topicTitle: p.piTitle || p.piTitle || "",
      topicAbbreviation: p.piAbbreviation || p.piAbbreviation || "",
      topicDescription: p.piDescription || p.piDescription || "",
      status: p.piStatus
        ? String(p.piStatus).charAt(0) +
          String(p.piStatus).slice(1).toLowerCase()
        : null,
      allowEdit: typeof p.isAllowEdit === "boolean" ? p.isAllowEdit : true,
      rejectReason: p.piRejectReason || null,
      approvedBy: p.piApprovedBy || null,
      approvedAt: p.piApprovedAt || null,
      groupId: p.groupId,
      attachments: Array.isArray(p.piDocumentIds)
        ? p.piDocumentIds.map((id) => ({ id }))
        : [],
      createdBy: p.createdBy || null,
      registerAt: p.createdAt || p.piCreatedAt || null,
      updateBy: p.updateBy || null,
      updateAt: p.updateAt || null,
    }));

    dispatch(setPlans(mapped));
    dispatch(setPending(false));
    return mapped;
  } catch (e) {
    const msg =
      (e &&
        e.response &&
        e.response.data &&
        (e.response.data.message || JSON.stringify(e.response.data))) ||
      e.message ||
      "Unknown error";
    console.error("[addPlanApi] failed to add plan", {
      error: e,
      response: e.response && e.response.data,
    });
    dispatch(setError(msg));
    dispatch(setPending(false));
    const err = new Error(msg);
    err.original = e;
    throw err;
  }
};

export const getTopicsByGroupId = async (dispatch, token, groupId) => {
  if (!groupId) {
    return [];
  }
  try {
    dispatch(setPending(true));
    const url = `${REACT_API_URL}topic/group/${groupId}`;
    const response = await axios.get(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    let data = [];
    if (Array.isArray(response.data)) data = response.data;
    else if (response.data && typeof response.data === "object")
      data = [response.data];
    const mapped = data.map((p) => ({
      topicId: p.piId || p.id || "",
      topicTitle: p.piTitle || p.title || "",
      topicAbbreviation: p.piAbbreviation || p.piAbbreviation || "",
      topicDescription: p.piDescription || p.description || "",
      status: p.piStatus
        ? String(p.piStatus).charAt(0) +
          String(p.piStatus).slice(1).toLowerCase()
        : null,
      allowEdit: typeof p.isAllowEdit === "boolean" ? p.isAllowEdit : true,
      rejectReason: p.piRejectReason || null,
      approvedBy: p.piApprovedBy || null,
      approvedAt: p.piApprovedAt || null,
      groupId: p.groupId,
      attachments: Array.isArray(p.piDocumentIds)
        ? p.piDocumentIds.map((id) => ({ id }))
        : [],
      createdBy: p.createdBy || null,
      registerAt: p.createdAt || p.piCreatedAt || null,
      updateBy: p.updateBy || null,
      updateAt: p.updateAt || null,
    }));

    const mapWithPlanGroup = data.map((p) => ({
      topicId: p.piId || p.id || "",
      topicTitle: p.piTitle || p.title || "",
      status: p.piStatus
        ? String(p.piStatus).charAt(0) +
          String(p.piStatus).slice(1).toLowerCase()
        : null,
    }));

    dispatch(setPlansGroup(mapWithPlanGroup));
    dispatch(setPlans(mapped));
    dispatch(setPending(false));
    return mapped;
  } catch (e) {
    const msg =
      (e &&
        e.response &&
        e.response.data &&
        (e.response.data.message || JSON.stringify(e.response.data))) ||
      e.message ||
      "Unknown error";
    console.error("[getTopicsByGroupId] failed", {
      error: e,
      response: e.response && e.response.data,
    });
    dispatch(setError(msg));
    dispatch(setPending(false));
    const err = new Error(msg);
    err.original = e;
    throw err;
  }
};

export const updatePlanApi = async (payload, token, dispatch) => {
  try {
    dispatch(setPending(true));

    // normalize base and endpoint
    const apiBase = REACT_API_URL.replace(/\/+$/g, "");
    const url = `${apiBase}/topic/`;

    // Build API payload expected by backend (include piId for updates)
    const apiPayload = {
      piId: payload?.piId || payload?.topicId || "",
      piTitle: payload?.topicTitle || payload?.piTitle || "",
      piAbbreviation:
        payload?.topicAbbreviation || payload?.piAbbreviation || "",
      piDescription: payload?.topicDescription || payload?.piDescription || "",
      piStatus: payload?.status || payload?.piStatus || "PENDING",
      piRejectReason: payload?.rejectReason || payload?.piRejectReason || null,
      piApprovedBy: payload?.approvedBy || payload?.piApprovedBy || null,
      piApprovedAt: payload?.approvedAt || payload?.piApprovedAt || null,
      isAllowEdit:
        typeof payload?.allowEdit === "boolean"
          ? payload.allowEdit
          : typeof payload?.isAllowEdit === "boolean"
          ? payload.isAllowEdit
          : true,
      groupId: payload?.groupId || payload?.group || null,
      piDocumentIds: Array.isArray(payload?.attachments)
        ? payload.attachments.map((a) => a.id).filter(Boolean)
        : Array.isArray(payload?.piDocumentIds)
        ? payload.piDocumentIds
        : [],
    };

    // sanitize payload: normalize status, ensure document ids are strings, remove null/undefined
    if (apiPayload.piStatus)
      apiPayload.piStatus = String(apiPayload.piStatus).toUpperCase();
    if (Array.isArray(apiPayload.piDocumentIds)) {
      apiPayload.piDocumentIds = apiPayload.piDocumentIds
        .map((id) => (id && typeof id === "object" ? id.id || "" : id))
        .filter(Boolean)
        .map(String);
    }

    // remove keys with null or undefined values (send only concrete fields)
    Object.keys(apiPayload).forEach((k) => {
      if (
        apiPayload[k] === null ||
        apiPayload[k] === undefined ||
        apiPayload[k] === ""
      ) {
        // keep piId even if empty? ensure piId exists for updates
        if (k === "piId") return;
        delete apiPayload[k];
      }
    });

    const response = await axios.post(url, apiPayload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const p = response.data || {};
    const mapped = {
      topicId: p.piId || p.id || apiPayload.piId || "",
      topicTitle: p.piTitle || apiPayload.piTitle,
      topicAbbreviation: p.piAbbreviation || apiPayload.piAbbreviation,
      topicDescription: p.piDescription || apiPayload.piDescription,
      status: p.piStatus
        ? String(p.piStatus).charAt(0) +
          String(p.piStatus).slice(1).toLowerCase()
        : apiPayload.piStatus
        ? String(apiPayload.piStatus).charAt(0) +
          String(apiPayload.piStatus).slice(1).toLowerCase()
        : null,
      allowEdit:
        typeof p.isAllowEdit === "boolean"
          ? p.isAllowEdit
          : apiPayload.isAllowEdit,
      rejectReason: p.piRejectReason || apiPayload.piRejectReason || null,
      approvedBy: p.piApprovedBy || apiPayload.piApprovedBy || null,
      approvedAt: p.piApprovedAt || apiPayload.piApprovedAt || null,
      groupId: p.groupId || apiPayload.groupId,
      attachments: Array.isArray(p.piDocumentIds)
        ? p.piDocumentIds.map((id) => ({ id }))
        : [],
      createdBy: p.createdBy || null,
      registerAt: p.createdAt || p.piCreatedAt || null,
      updateBy: p.updateBy || null,
      updateAt: p.updateAt || null,
    };

    dispatch(updatePlan(mapped));
    dispatch(setPending(false));
    return mapped;
  } catch (e) {
    const msg =
      (e &&
        e.response &&
        e.response.data &&
        (e.response.data.message || JSON.stringify(e.response.data))) ||
      e.message ||
      "Unknown error";
    dispatch(setError(msg));
    dispatch(setPending(false));
    const err = new Error(msg);
    err.original = e;
    throw err;
  }
};

export const getDeadlineById = async (topicId) => {
  try {
    const resp = await axios.get(
      `http://localhost:3000/deadline?topicId=${topicId}`
    );
    return resp;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const getDeadline = async (topicId, dispatch) => {
  try {
    const resp = await axios.get(
      `http://localhost:3000/deadline?topicId=${topicId}`
    );
    dispatch(setDeadline(resp.data[0] || null));
    return resp;
  } catch (e) {
    throw new Error(e.message);
  }
};

export const saveDeadline = async (groupId, topicId, deadline, dispatch) => {
  try {
    dispatch(setPending(true));

    const getTopic = await getDeadlineById(topicId);
    let response;
    if (getTopic.data.length > 0) {
      const deadlineId = getTopic.data[0].id;

      response = await axios.put(
        `http://localhost:3000/deadline/${deadlineId}`,
        {
          ...getTopic.data[0],
          deadline,
        }
      );

      dispatch(updateDeadline(response.data));
    } else {
      response = await axios.post("http://localhost:3000/deadline", {
        groupId,
        topicId,
        deadline,
      });

      dispatch(addDeadlinePlan(response.data));
    }

    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setPending(false));
    throw e;
  }
};

export const addPlanApi = async (planData, token, dispatch) => {
  try {
    dispatch(setPending(true));
    const url = `${REACT_API_URL}topic/`;

    // Map frontend planData to API payload
    const payload = {
      piTitle: planData.topicTitle || planData.piTitle || "",
      piAbbreviation:
        planData.topicAbbreviation || planData.piAbbreviation || "",
      piDescription: planData.topicDescription || planData.piDescription || "",
      // piObjective omitted: backend does not use this field
      piStatus: planData.status || "PENDING",
      piRejectReason: planData.rejectReason || null,
      piApprovedBy: planData.approvedBy || null,
      piApprovedAt: planData.approvedAt || null,
      isAllowEdit:
        typeof planData.allowEdit === "boolean" ? planData.allowEdit : true,
      groupId: planData.groupId || planData.group || null,
      piDocumentIds: Array.isArray(planData.attachments)
        ? planData.attachments.map((a) => a.id).filter(Boolean)
        : [],
    };

    const response = await axios.post(url, payload, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    // Map API response back to frontend topic shape
    const p = response.data || {};
    console.log("Service Plane call: ", p);
    const mapped = {
      topicId: p.piId || p.id || "",
      topicTitle: p.piTitle || payload.piTitle,
      topicAbbreviation: p.piAbbreviation || payload.piAbbreviation,
      topicDescription: p.piDescription || payload.piDescription,
      // topicObjective omitted: backend does not provide this
      status: p.piStatus
        ? String(p.piStatus).charAt(0) +
          String(p.piStatus).slice(1).toLowerCase()
        : payload.piStatus,
      allowEdit:
        typeof p.isAllowEdit === "boolean"
          ? p.isAllowEdit
          : payload.isAllowEdit,
      rejectReason: p.piRejectReason || payload.piRejectReason || null,
      approvedBy: p.piApprovedBy || payload.piApprovedBy || null,
      approvedAt: p.piApprovedAt || payload.piApprovedAt || null,
      groupId: p.groupId || payload.groupId,
      attachments: Array.isArray(p.piDocumentIds)
        ? p.piDocumentIds.map((id) => ({ id }))
        : [],
      createdBy: p.createdBy || null,
      createdAt: p.createdAt || p.piCreatedAt || null,
      updateBy: p.updateBy || null,
      updateAt: p.updateAt || null,
    };

    dispatch(addPlan(mapped));
    dispatch(setPending(false));
    return mapped;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const deletePlanApi = async (topicId, token, dispatch) => {
  try {
    dispatch(setPending(true));

    // normalize base and endpoint
    const apiBase = REACT_API_URL.replace(/\/+$/g, "");
    const url = `${apiBase}/topic/${topicId}`;

    await axios.delete(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    dispatch(deletePlan(topicId));
    dispatch(setPending(false));
    return topicId;
  } catch (e) {
    const msg =
      (e &&
        e.response &&
        e.response.data &&
        (e.response.data.message || JSON.stringify(e.response.data))) ||
      e.message ||
      "Unknown error";
    dispatch(setError(msg));
    dispatch(setPending(false));
    throw new Error(msg);
  }
};
