import axios from 'axios';
import { setPending, setStatus, setError, addStatus } from '../redux/slice/statusSlice';
const API_STATUS = 'https://stacklog.id.vn/api/task';

const statusApi = () => {
  const getStatus = async (token, groupId, dispatch) => {
    try {
      dispatch(setPending(true));
      const res = await axios.get(`http://localhost:3001/status?groupId=${groupId}`, {
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

  return { getAllStatus, getStatus, addStatuses };
};

export default statusApi;
