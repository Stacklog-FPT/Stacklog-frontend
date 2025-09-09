import axios from 'axios';
import {
  getClassesStart,
  getClassesSuccess,
  getClassesFailure,
  apiStart,
  apiSuccess,
  apiFailure,
} from '../redux/slice/classSlice';
import { getGroups } from '../redux/slice/groupSlice';
import { REACT_API_URL } from '../api/apiConfig';
const CLASS_URI = REACT_API_URL + 'class';

const ClassService = () => {
  const createClass = async (semesterId, token, classData, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      if (!semesterId) throw new Error('Semester ID is missing');
      const response = await axios.post(`${CLASS_URI}/class?semesterId=${semesterId}`, classData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      const serverMsg = error.response?.data?.message || error.response?.data || null;
      throw new Error(serverMsg || 'Failed to create class: ' + error.message);
    }
  };

  const craeteGroup = async (token, groupData, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      const response = await axios.post(`${CLASS_URI}/group`, groupData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      const serverMsg = error.response?.data?.message || error.response?.data || null;
      throw new Error(serverMsg || 'Failed to create group: ' + error.message);
    }
  };

  const generateInviteCode = async (token, classId, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      if (!classId) throw new Error('Class ID is missing');
      const response = await axios.get(`${CLASS_URI}/class/generateInviteCode/${classId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error('Failed to generate invite code: ' + error.message);
    }
  };

  const joinClassByInviteCode = async (token, inviteCode, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      const response = await axios.get(`${CLASS_URI}/class/join?code=${inviteCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error(error.response?.data?.message || 'Failed to join class: ' + error.message);
    }
  };

  const deleteUserinGroup = async (token, groupId, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      const response = await axios.delete(`${CLASS_URI}/groupstudent/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error(
        error.response?.data?.message || 'Failed to delete user from group: ' + error.message,
      );
    }
  };

  const leaveGroup = async (token, payload, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      const response = await axios.put(`${CLASS_URI}/groupstudent/leave`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error('Failed to leave group: ' + error.message);
    }
  };

  const kickUserFromGroup = async (token, userId, payload, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      const response = await axios.put(`${CLASS_URI}/groupstudent/kick/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error('Failed to kick user from group: ' + error.message);
    }
  };

  const updateMemberToGroup = async (token, payload, dispatch) => {
    try {
      dispatch && dispatch(apiStart());
      if (!token) throw new Error('Token is missing');
      const response = await axios.put(`${CLASS_URI}/group/update`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch && dispatch(apiSuccess());
      return response.data;
    } catch (error) {
      dispatch && dispatch(apiFailure(error.message));
      throw new Error('Failed to add member to group: ' + error.message);
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
          ? rawMembers.map((s) => (typeof s === 'string' ? s : s.userId || s))
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
    console.log('getClasses response (normalized):', normalized);
    const normalizedGroups = normalized.flatMap((c) => c.groups || []);
    dispatch(getClassesSuccess(normalized));
    dispatch(getGroups(normalizedGroups));
    return normalized;
  } catch (e) {
    dispatch(getClassesFailure(e.message));
    return [];
  }
};
export default ClassService;
