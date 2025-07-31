import axios from "axios";

const LECTURER_API = "http://103.166.183.142:8080/api/profile/user";
const LectureService = () => {
  const addLecture = async (token, payload) => {
    try {
      if (!token) throw new Error("Token is missing!");

      const response = await axios.post(`${LECTURER_API}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return { addLecture };
};

export default LectureService;
