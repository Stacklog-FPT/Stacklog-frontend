import axios from "axios";

const API_STATUS = "http://103.166.183.142:8080/api/task";

const statusApi = () => {
  const getAllStatus = async (token) => {
    try {
      const response = await axios.get(`${API_STATUS}/status-task/group_1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (e) {
      throw Error(e.message);
    }
  };

  return {getAllStatus}
};

export default statusApi;
