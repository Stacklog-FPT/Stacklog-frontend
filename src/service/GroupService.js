import axios from "axios";

const GROUP_API = "https://stacklog.id.vn/api/profile/user/group";
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
        "https://stacklog.id.vn/api/class/group",
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
