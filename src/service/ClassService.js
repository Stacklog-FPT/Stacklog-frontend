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

  const createClass = async (token, classData) => {
    try {
      if (!token) throw new Error("Token is missing");
      const response = await axios.post(`${CLASS_URI}/class`, classData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to create class: " + error.message);
    }
  };

  const craeteGroup = async (token, groupData) => {
    try {
      if (!token) throw new Error("Token is missing");
      const response = await axios.post(`${CLASS_URI}/group`, groupData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to create group: " + error.message);
    }
  };

  const generateInviteCode = async (token, classId) => {
    try {
      if (!token) throw new Error("Token is missing");
      if (!classId) throw new Error("Class ID is missing");
      const response = await axios.get(
        `${CLASS_URI}/class/generateInviteCode/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to generate invite code: " + error.message);
    }
  };

  const joinClassByInviteCode = async (token, inviteCode) => {
    try {
      const response = await axios.get(
        `${CLASS_URI}/class/join?code=${inviteCode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
          "Failed to join class: " + error.message
      );
    }
  };

  return {
    getMembersInClass,
    getMembersClassLecture,
    getClassesByRole,
    createClass,
    craeteGroup,
    generateInviteCode,
    joinClassByInviteCode,
  };
};

export default ClassService;
