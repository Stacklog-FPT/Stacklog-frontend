import axios from "axios";

const SCHEDULE_API = "http://103.166.183.142:8080/api/schedule";
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

  return { getScheduleByUser, addCreateSlot };
};

export default ScheduleService;
