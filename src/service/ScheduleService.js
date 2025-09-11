import axios from "axios";
import {
  getSchedules,
  setError,
  setPending,
  resetSchedule,
  addSchedules,
  deleteSchedules,
  updateSchedules,
} from "../redux/slice/scheduleSlice";
import { REACT_API_URL } from "../api/apiConfig";

const SCHEDULE_API = REACT_API_URL + "schedule";

// Convert Date or ISO/local string to a local datetime string "YYYY-MM-DDTHH:mm:ss"
const toLocalDateTimeString = (input) => {
  if (!input) return "";
  let d;
  if (input instanceof Date) d = input;
  else if (typeof input === "string") {
    // If string contains timezone (Z or +HH:MM/-HH:MM), parse as absolute time then convert to local
    if (/[zZ]|[+\-]\d{2}:?\d{2}$/.test(input)) {
      d = new Date(input);
    } else {
      // assume format 'YYYY-MM-DDTHH:mm:ss' (local) and construct local Date
      const m = input.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
      if (m) {
        const [, Y, Mo, D, H, Mi, S] = m;
        d = new Date(Number(Y), Number(Mo) - 1, Number(D), Number(H), Number(Mi), Number(S || 0));
      } else {
        d = new Date(input);
      }
    }
  } else {
    d = new Date(input);
  }

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`;
};

// Helper: normalize various forms of user assignments into an array of id strings
const normalizeUserIdAssigns = (maybeIds) => {
  if (!maybeIds) return [];
  if (Array.isArray(maybeIds)) {
    return maybeIds
      .map((u) => {
        if (!u) return null;
        if (typeof u === "string") return u;
        // common id fields
        return u.userId || u._id || u.id || u.work_id || null;
      })
      .filter(Boolean);
  }

  if (typeof maybeIds === "string") {
    // comma separated string
    return maybeIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // single object
  if (typeof maybeIds === "object") {
    return [
      maybeIds.userId || maybeIds._id || maybeIds.id || maybeIds.work_id,
    ].filter(Boolean);
  }

  return [];
};

// Public API
export const getScheduleByGroupId = async (token, groupId, dispatch) => {
  try {
    if (!token) {
      dispatch(setError("The token is missing!"));
      return;
    }
    dispatch(setPending(true));
    const response = await axios.get(`${SCHEDULE_API}/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    dispatch(resetSchedule());
    // backend expected to return array of schedules
    // normalize backend "slotAssigns" -> front-end "assignTo" / "userIdAssigns"
    const normalized = Array.isArray(response.data)
      ? response.data.map((item) => {
          const assignIds = (item.slotAssigns || [])
            .map((a) => a.userId)
            .filter(Boolean);
          return { ...item, assignTo: assignIds, userIdAssigns: assignIds };
        })
      : response.data;
    dispatch(getSchedules(normalized));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || "Failed to fetch schedules"));
    throw e;
  }
};

export const addSlotByGroup = async (token, data, dispatch) => {
  try {
    if (!token) throw new Error("Token is missing!");
    dispatch(setPending(true));

    const userIdAssigns = normalizeUserIdAssigns(
      data.userIdAssigns || data.assignTo || data.userAssigns
    );

    const payload = {
      slotTitle: data.slotTitle || data.title || "",
      slotDescription: data.slotDescription || data.description || "",
      // accept slotStartTime, legacy slotStarTime, or Date objects
      slotStartTime:
        data.slotStartTime || data.slotStarTime || toLocalDateTimeString(data.start),
      groupId: data.groupId || data.group || "",
      userIdAssigns,
    };

    const response = await axios.post(`${SCHEDULE_API}/save`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // assume backend returns created/updated slot(s)
    dispatch(addSchedules(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || "Failed to add slot"));
    throw e;
  }
};

export const updateScheduleSlot = async (token, slotId, slotData, dispatch) => {
  try {
    if (!token) throw new Error("Token is missing!");
    dispatch(setPending(true));

    const userIdAssigns = normalizeUserIdAssigns(
      slotData.userIdAssigns || slotData.assignTo || slotData.userAssigns
    );

    const payload = {
      slotId: slotId || slotData.slotId || slotData.id || "",
      slotTitle: slotData.slotTitle || slotData.title || "",
      slotDescription: slotData.slotDescription || slotData.description || "",
      slotStartTime:
        slotData.slotStartTime || slotData.slotStarTime || toLocalDateTimeString(slotData.start),
      groupId: slotData.groupId || slotData.group || "",
      userIdAssigns,
    };

    const response = await axios.post(`${SCHEDULE_API}/save`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    dispatch(updateSchedules(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || "Failed to update slot"));
    throw e;
  }
};

export const deleteScheduleSlot = async (token, slotId, dispatch) => {
  try {
    if (!token) throw new Error("Token is missing!");
    if (!slotId) throw new Error("Slot ID is missing!");
    dispatch(setPending(true));

    const response = await axios.delete(`${SCHEDULE_API}/delete/${slotId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(deleteSchedules(slotId));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || "Failed to delete slot"));
    throw e;
  }
};

export const getPersonalScheduleBySemester = async (
  token,
  semesterId,
  dispatch
) => {
  try {
    if (!token) {
      dispatch(setError("The token is missing!"));
      return;
    }
    dispatch(setPending(true));
    // call personal endpoint with semesterId as query param
    const response = await axios.get(`${SCHEDULE_API}/personal`, {
      params: { semesterId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    dispatch(resetSchedule());
    // backend expected to return array of schedules
    // backend returns `slotAssigns` with objects { userId } — convert to assignTo/userIdAssigns arrays
    const normalized = Array.isArray(response.data)
      ? response.data.map((item) => {
          const assignIds = (item.slotAssigns || [])
            .map((a) => a.userId)
            .filter(Boolean);
          return { ...item, assignTo: assignIds, userIdAssigns: assignIds };
        })
      : response.data;
    dispatch(getSchedules(normalized));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e.message || "Failed to fetch schedules"));
    throw e;
  }
};

// default export for compatibility with existing imports
const ScheduleService = () => ({
  getScheduleByGroupId,
  addSlotByGroup,
  updateScheduleSlot,
  deleteScheduleSlot,
  getPersonalScheduleBySemester,
});

export default ScheduleService;
