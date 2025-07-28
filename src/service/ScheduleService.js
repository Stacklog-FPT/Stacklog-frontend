import axios from "axios";

const SCHEDULE_API = "http://103.166.183.142:8080/api/schedule/user";
const ScheduleService = () => {
  const getScheduleByUser = async (token) => {
    try {
      const response = await axios.get(`${SCHEDULE_API}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return { getScheduleByUser };
};

export default ScheduleService;
