import axios from "axios";

const GROUP_API = "http://103.166.183.142:8080/api/profile/user/group";
const GroupService = () => {
  const getAllGroup = async (token) => {
    try {
      if (!token) return new Error("Token is missing!");

      const response = await axios.get(`${GROUP_API}/group_1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (e) {
      return new Error(e.message);
    }
  };

  const getGroupByClass = async (token) => {
    try {
      if (!token) throw new Error("Token is missing!");

      const response = await axios.get(
        "http://103.166.183.142:8080/api/class/group",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return { getAllGroup, getGroupByClass };
};

export default GroupService;
