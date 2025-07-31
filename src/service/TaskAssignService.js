import axios from "axios";

const TASK_ASSIGN_API = "";
const TaskAssignService = () => {
  const addTaskAssign = async (token, memberList) => {
    try {
      if (!token) throw new Error("Invalid token || Token is missing!");

      const response = await axios.post(`${TASK_ASSIGN_API}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (e) {
      throw new Error(e.message || "Somethings wrong!");
    }
  };
};

export default TaskAssignService;
