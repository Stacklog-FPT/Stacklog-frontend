import axios from "axios";
import {
  getClassesStart,
  getClassesSuccess,
  getClassesFailure,
  apiStart,
  apiSuccess,
  apiFailure,
} from "../redux/slice/classSlice";
import { getGroups } from "../redux/slice/groupSlice";
import { REACT_API_URL } from "../api/apiConfig";
const CLASS_URI = REACT_API_URL + "class";

const ClassService = () => {
  const createClass = async (semesterId, token, classData, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      if (!semesterId) throw new Error("Semester ID is missing");
      const response = await axios.post(
        `${CLASS_URI}/class?semesterId=${semesterId}`,
        classData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      const serverMsg =
        error.response?.data?.message || error.response?.data || null;
      throw new Error(serverMsg || "Failed to create class: " + error.message);
    }
  };

  const craeteGroup = async (token, groupData, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      const response = await axios.post(`${CLASS_URI}/group`, groupData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      const serverMsg =
        error.response?.data?.message || error.response?.data || null;
      throw new Error(serverMsg || "Failed to create group: " + error.message);
    }
  };

  const generateInviteCode = async (token, classId, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      if (!classId) throw new Error("Class ID is missing");
      const response = await axios.get(
        `${CLASS_URI}/class/generateInviteCode/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error("Failed to generate invite code: " + error.message);
    }
  };

  const joinClassByInviteCode = async (token, inviteCode, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      const response = await axios.get(
        `${CLASS_URI}/class/join?code=${inviteCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error(
        error.response?.data?.message ||
          "Failed to join class: " + error.message
      );
    }
  };

  const deleteUserinGroup = async (token, groupId, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      const response = await axios.delete(
        `${CLASS_URI}/groupstudent/${groupId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error(
        error.response?.data?.message ||
          "Failed to delete user from group: " + error.message
      );
    }
  };

  const leaveGroup = async (token, payload, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      const response = await axios.put(
        `${CLASS_URI}/groupstudent/leave`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error("Failed to leave group: " + error.message);
    }
  };

  const kickUserFromGroup = async (token, userId, payload, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      const response = await axios.put(
        `${CLASS_URI}/groupstudent/kick/${userId}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error("Failed to kick user from group: " + error.message);
    }
  };

  const deleteStudentFromClass = async (token, studentId, classId, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      if (!studentId) throw new Error('studentId is missing');
      if (!classId) throw new Error('classId is missing');

      const url = `${CLASS_URI}/groupstudent/delete-student?studentId=${encodeURIComponent(
        studentId
      )}&classId=${encodeURIComponent(classId)}`;

      const response = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      const serverMsg = error.response?.data?.message || error.response?.data || null;
      throw new Error(serverMsg || 'Failed to delete student from class: ' + error.message);
    }
  };

  const updateMemberToGroup = async (token, payload, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error("Token is missing");
      const response = await axios.put(`${CLASS_URI}/group/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error("Failed to add member to group: " + error.message);
    }
  };

  return {
    getClasses,
    createClass,
    craeteGroup,
    generateInviteCode,
    joinClassByInviteCode,
    deleteUserinGroup,
    leaveGroup,
    kickUserFromGroup,
    updateMemberToGroup,
    deleteStudentFromClass,
  };
};

export const getClasses = async (semesterId, token, dispatch) => {
  try {
    dispatch(getClassesStart());
    const response = await axios(`${CLASS_URI}/class/${semesterId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const raw = response.data;
    const data = Array.isArray(raw) ? raw : raw?.data || [];
    // normalize: ensure each class object has semesterId (so components that filter by semesterId work)
    // and normalize group students to `groupStudent` as array of ids (supporting groupStudents array of objects)
    const normalized = (data || []).map((c) => {
      const groups = (c.groups || []).map((gr) => {
        const rawMembers = gr.groupStudent || gr.groupStudents || [];
        const groupStudent = Array.isArray(rawMembers)
          ? rawMembers.map((s) => (typeof s === "string" ? s : s.userId || s))
          : [];
        return {
          ...gr,
          groupStudent,
          // keep original array if present
          groupStudents: gr.groupStudents || gr.groupStudent || [],
        };
      });
      return {
        ...c,
        semesterId,
        groups,
      };
    });
    console.log("getClasses response (normalized):", normalized);
    const normalizedGroups = normalized.flatMap((c) => c.groups || []);
    dispatch(getClassesSuccess(normalized));
    dispatch(getGroups(normalizedGroups));
    return normalized;
  } catch (e) {
    dispatch(getClassesFailure(e.message));
    return [];
  }
};

// Export class as an Excel file by classId (returns arraybuffer + filename)
export const exportClassByClassId = async (classId, token) => {
  if (!token) throw new Error("Missing token or Invalid Token");
  if (!classId) throw new Error("Missing classId");

  const url = `${CLASS_URI}/class/export-by-class?classId=${encodeURIComponent(
    classId
  )}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "arraybuffer",
    });

    // try to parse filename from Content-Disposition
    const disposition =
      response.headers["content-disposition"] ||
      response.headers["Content-Disposition"];
    let filename = "class_export.xlsx";
    if (disposition) {
      const fileMatch = disposition.match(
        /filename\*?=(?:UTF-8'')?"?([^";]+)/i
      );
      if (fileMatch && fileMatch[1]) {
        try {
          filename = decodeURIComponent(fileMatch[1]);
        } catch (e) {
          filename = fileMatch[1];
        }
      }
    }

    const contentType =
      response.headers["content-type"] ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return {
      data: response.data,
      filename,
      contentType,
      headers: response.headers,
    };
  } catch (e) {
    const msg =
      e?.response?.data?.message || e?.message || "Failed to export classes";
    throw new Error(msg);
  }
};

// Client helper: saves an ArrayBuffer (from exportClassByClassId.data) as a file in the browser
export const saveArrayBufferAsFile = (
  arrayBuffer,
  filename = "export.xlsx",
  contentType
) => {
  const blob = new Blob([arrayBuffer], {
    type: contentType || "application/octet-stream",
  });
  if (
    typeof window !== "undefined" &&
    window.navigator &&
    window.navigator.msSaveOrOpenBlob
  ) {
    // IE/Edge
    window.navigator.msSaveOrOpenBlob(blob, filename);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

// Convenience: call exportClassByClassId and trigger browser download
export const exportClassAndDownload = async (classId, token) => {
  const res = await exportClassByClassId(classId, token);
  saveArrayBufferAsFile(res.data, res.filename, res.contentType);
  return res;
};

// Import (upload) an Excel file to populate/modify a class by classId
// POST /api/class/class/import?classId={classId}
export const importClassByClassId = async (
  classId,
  file /* File object */,
  token,
  dispatch
) => {
  if (!token) throw new Error("Missing token or Invalid Token");
  if (!classId) throw new Error("Missing classId");
  if (!file) throw new Error("Missing file to upload");

  const url = `${CLASS_URI}/class/import?classId=${encodeURIComponent(
    classId
  )}`;
  try {
    dispatch && dispatch(apiStart());
    const form = new FormData();
    // backend expected field name is assumed to be 'file'
    form.append("file", file);

    const response = await axios.post(url, form, {
      headers: {
        Authorization: `Bearer ${token}`,
        // Do NOT set Content-Type: let the browser set the multipart boundary
      },
    });

    dispatch && dispatch(apiSuccess());
    return response.data;
  } catch (e) {
    dispatch && dispatch(apiFailure(e.message));
    const msg =
      e?.response?.data?.message || e?.message || "Failed to import class";
    throw new Error(msg);
  }
};

export default ClassService;
