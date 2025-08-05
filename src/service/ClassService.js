import axios from "axios";

const CLASS_URI = "http://103.166.183.142:8080/api/class";

const ClassService = () => {
  const getMembersInClass = async (token) => {
    try {
      if (!token) throw new Error("Token is missing");
      const response = await axios.get(`${CLASS_URI}/class`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const getMembersClassLecture = async (token) => {
    try {
      if (!token) throw new Error("Token is missing");
      const response = await axios.get(`${CLASS_URI}/class/lecture`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const getClassesByRole = async (token, role) => {
    if (role === "STUDENT") {
      return await getMembersInClass(token);
    } else if (role === "LECTURER") {
      return await getMembersClassLecture(token);
    } else {
      return [];
    }
  };

  return { getMembersInClass, getMembersClassLecture, getClassesByRole };
};

export default ClassService;
