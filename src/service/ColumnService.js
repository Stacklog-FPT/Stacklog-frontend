import axios from 'axios';
import {
  setPending,
  setStatus,
  setError,
  addStatus,
  deleteStatus,
  updateStatus,
} from '../redux/slice/statusSlice';
const API_STATUS = 'https://stacklog.id.vn/api/task';

const statusApi = () => {
  const addStatuses = async (token, statusData, groupId, dispatch) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/status?groupId=${groupId}`,
        statusData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      dispatch(addStatus(response.data));
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const getAllStatus = async (token, groupId) => {
    try {
      const response = await axios.get(`${API_STATUS}/status-task/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (e) {
      throw Error(e.message);
    }
  };

  return { getAllStatus, addStatuses };
};

//
export const getStatus = async (token, groupId, dispatch) => {
  try {
    dispatch(setPending(true));
    const res = await axios.get(`http://localhost:3001/status?groupId=${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(setStatus(res.data));
    dispatch(setPending(false));
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(setPending(false));
  }
};

export const deleteStatusApi = async (token, statusTaskId, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is missing is invalid!'));
    const response = await axios.delete(`http://localhost:3001/status/${statusTaskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    dispatch(deleteStatus(statusTaskId));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export const updateStatusApi = async (token, statusTaskId, statusData, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is invalid'));
    dispatch(setPending(true));
    const response = await axios.put(`http://localhost:3001/status/${statusTaskId}`, statusData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(updateStatus(response.data));
    dispatch(setPending(false));
    console.log(response);
    return response;
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export default statusApi;
