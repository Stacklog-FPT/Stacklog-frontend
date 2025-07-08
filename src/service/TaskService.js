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
    if (!token) throw new Error("Unauthorization!");

    try {

    } catch (e) {
      throw Error(e.message);
    }
  };

  return { getAllTask };
};

export default taskService;
