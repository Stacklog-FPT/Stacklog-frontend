import axios from 'axios';
import {
  setError,
  setPending,
  getNotifications,
  addNotifications,
  deleteNotification,
} from '../redux/slice/notificationSlice';
const NOTIFI_API = 'https://stacklog.id.vn/api/notification';

export const getAllNotification = async (token, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is not valid!'));
    dispatch(setPending(true));
    const response = await axios.get(`http://localhost:3000/notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(getNotifications(response.data));
    dispatch(setPending(false));
  } catch (e) {
    dispatch(setError);
    throw new Error(e.message || 'Something went wrong!');
  }
};

export const createNotification = async (token, data, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is not valid!'));
    dispatch(setPending(true));
    const response = await axios.post(`http://localhost:3000/notifications`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(addNotifications(response.data));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message) || 'Something went wrong');
  }
};

export const deleteNotificationApi = async (token, id, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is not valid!'));
    dispatch(setPending(true));

    const response = await axios.delete(`http://localhost:3000/notifications/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(deleteNotification(id));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
  }
};
