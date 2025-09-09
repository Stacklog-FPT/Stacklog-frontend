import axios from 'axios';
import {
  setPending,
  setStatus,
  setError,
  addStatus,
  deleteStatus,
  updateStatus,
} from '../redux/slice/statusSlice';
import { REACT_API_URL } from '../api/apiConfig';
const STATUS_API = REACT_API_URL + 'task/status-task';

const statusApi = () => {
  const addStatuses = async (token, statusData, dispatch) => {
    try {
      const response = await axios.post(`${STATUS_API}`, statusData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('response status: ', response.data);
      dispatch(addStatus(response.data));
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const getAllStatus = async (token, groupId) => {
    try {
      const response = await axios.get(`${API_STATUS}${groupId}`, {
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
    console.log('debug: ', groupId);
    dispatch(setPending(true));
    const res = await axios.get(`${STATUS_API}/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('debug status:', res.data);
    dispatch(setStatus(res.data));
    dispatch(setPending(false));
  } catch (err) {
    dispatch(setError(err.message));
    dispatch(setPending(false));
  }
};

export const deleteStatusApi = async (token, statusTaskId, dispatch) => {
  console.log('debug service: ', statusTaskId);
  try {
    if (!token) dispatch(setError('The token is missing is invalid!'));
    const response = await axios.delete(`${STATUS_API}/${statusTaskId}`, {
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

export const updateStatusApi = async (token, statusData, dispatch) => {
  console.log('Call me');
  try {
    if (!token) dispatch(setError('The token is invalid'));
    dispatch(setPending(true));
    const response = await axios.post(`${STATUS_API}`, statusData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Update Column:', response);
    dispatch(updateStatus(response.data));
    dispatch(setPending(false));
    console.log(response);
    return response;
  } catch (e) {
    dispatch(setError(e.message));
  }
};

export default statusApi;
