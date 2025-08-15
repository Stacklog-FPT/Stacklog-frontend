import axios from 'axios';
import { setPending, setStatus, setError } from '../redux/slice/statusSlice';
const API_STATUS = 'https://stacklog.id.vn/api/task';

const statusApi = () => {
  const getStatus = (token, groupId) => async (dispatch) => {
    try {
      dispatch(setPending(true));
      const res = await axios.get(`http://localhost:3000/status?groupId=${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);
      dispatch(setStatus(res.data));
      dispatch(setPending(false));
    } catch (err) {
      dispatch(setError(err.message));
      dispatch(setPending(false));
    }
  };

  const addStatuses = (token, statusData) => async (dispatch) => {
    try {
      const response = await axios.post('http://localhost:3000/status', statusData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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

  const addStatus = async (token, statusData) => {
    try {
      const response = await axios.post(`${API_STATUS}/status-task`, statusData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (e) {
      throw Error(e.message || 'Something wrong!');
    }
  };

  return { getAllStatus, addStatus, getStatus };
};

export default statusApi;
