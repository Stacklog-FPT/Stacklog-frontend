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
const ScheduleService = () => {
  // const getScheduleByUser = async (token) => {
  //   try {
  //     if (!token) throw new Error('Token is missing!');
  //     const response = await axios.get(`${SCHEDULE_API}/user`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     return response;
  //   } catch (e) {
  //     throw new Error(e.message);
  //   }
  // };

  // const addCreateSlot = async (token, data) => {
  //   try {
  //     if (!token) throw new Error('Token is missing!');

  //     const response = await axios.post(`${SCHEDULE_API}/`, data, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     return response;
  //   } catch (e) {
  //     throw new Error(e.message);
  //   }
  // };

  const updateScheduleSlot = async (token, data) => {
    try {
      if (!token) throw new Error("Token is missing!");

      const response = await axios.post(`${SCHEDULE_API}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const deleteScheduleSlot = async (token, slotId) => {
    try {
      if (!token) throw new Error("Token is missing!");
      if (!slotId) throw new Error("Slot ID is missing!");

      const response = await axios.delete(`${SCHEDULE_API}/delete/${slotId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete schedule slot: ${error.message}`);
    }
  };

  return {
    // getScheduleByUser,
    // addCreateSlot,
    updateScheduleSlot,
    deleteScheduleSlot,
  };
};

export const getScheduleByGroupId = async (token, groupId, dispatch) => {
  try {
    if (!token) dispatch(setError("The token is missing!"));
    dispatch(setPending(true));
    const response = await axios.get(`${SCHEDULE_API}/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    dispatch(resetSchedule());
    dispatch(getSchedules(response.data));
    dispatch(setPending(false));
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export const addSlotByGroup = async (token, data, dispatch) => {
  try {
    if (!token) throw new Error("Token is missing!");
    dispatch(setPending(true));

    // Normalize incoming data to backend contract
    const userIdAssigns = Array.isArray(data.userIdAssigns)
      ? data.userIdAssigns
          .map((u) => {
            if (!u) return null;
            if (typeof u === "string") return u;
            return u.userId || u._id || u.id || u.work_id || null;
          })
          .filter(Boolean)
      : typeof data.userIdAssigns === "string" && data.userIdAssigns.length
      ? data.userIdAssigns.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      slotTitle: data.slotTitle || "",
      slotDescription: data.slotDescription || "",
      slotStartTime: data.slotStartTime || data.slotStarTime || "",
      groupId: data.groupId || "",
      userIdAssigns,
    };

    const response = await axios.post(`${SCHEDULE_API}/save`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

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
    const response = await axios.put(
      `http://localhost:3001/schedule/${slotId}`,
      slotData,
      {
        //change slotId in component before mockup
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    dispatch(updateSchedules(response.data));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export const deleteScheduleSlot = async (token, slotId, dispatch) => {
  try {
    if (!token) throw new Error("Token is missing!");
    if (!slotId) throw new Error("Slot ID is missing!");
    dispatch(setPending(true));
    const response = await axios.delete(
      `http://localhost:3001/schedule/${slotId}`,
      {
        // Change slotId before mockup with BE
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(deleteSchedules(slotId));
    dispatch(setPending(false));
    return response;
  } catch (error) {
    dispatch(setError(e.message));
  }
};

export default ScheduleService;
