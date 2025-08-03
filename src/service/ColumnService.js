import axios from "axios";

const API_STATUS = "http://103.166.183.142:8080/api/task";

const statusApi = () => {
  const getAllStatus = async (token, groupId) => {
    try {
      const response = await axios.get(`${API_STATUS}/status-task/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (e) {
      throw Error(e.message);
    }
  };

  const addStatus = async (token, statusData) => {
    try {
      const response = await axios.post(
        `${API_STATUS}/status-task`,
        statusData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (e) {
      throw Error(e.message || "Something wrong!");
    }
  };

  return { getAllStatus, addStatus };
};

export default statusApi;
