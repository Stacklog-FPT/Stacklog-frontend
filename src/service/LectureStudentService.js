import axios from "axios";

const LECTURER_API = "https://stacklog.id.vn/api/profile/user";
const LectureService = () => {
  const createUser = async (token, payload) => {
    try {
      if (!token) throw new Error("Token is missing!");
      const response = await axios.post(`${LECTURER_API}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const adminGetUserByRole = async (token, role) => {
    try {
      if (!token) throw new Error("Token is missing!");
      const response = await axios.get(`${LECTURER_API}/role/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return { createUser, adminGetUserByRole };
};

export default LectureService;
