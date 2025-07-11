import axios from "axios";

const API_TASK = "http://103.166.183.142:8080/api/task";
const taskService = () => {
  const getAllTask = async (token) => {
    if (!token) throw new Error("Unauthorization!");
    try {
      const response = await axios.get(`${API_TASK}/task/group_1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      return response;
    } catch (e) {
      throw Error(e.message);
    }
  };

  const addTask = async (taskData, token) => {
    if (!token) throw new Error("Unauthorized!");

    try {
      const response = await axios.post(`${API_TASK}/task`, taskData, {
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

  return { getAllTask, addTask };
};

export default taskService;
