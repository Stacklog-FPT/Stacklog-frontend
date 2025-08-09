import axios from "axios";

const SCHEDULE_API = "https://stacklog.id.vn/api/schedule";
const ScheduleService = () => {
  const getScheduleByUser = async (token) => {
    try {
      if (!token) throw new Error("Token is missing!");
      const response = await axios.get(`${SCHEDULE_API}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const addCreateSlot = async (token, data) => {
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
    getScheduleByUser,
    addCreateSlot,
    updateScheduleSlot,
    deleteScheduleSlot,
  };
};

export default ScheduleService;
