import axios from "axios";

const CLASS_URI = "http://103.166.183.142:8080/api/class/class";
const ClassService = () => {
  const getMembersInClass = async (token) => {
    try {
      if (!token) throw new Error("Token is missing");
      const response = await axios.get(`${CLASS_URI}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Luôn trả về mảng
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return { getMembersInClass };
};

export default ClassService;
