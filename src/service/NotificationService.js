import axios from 'axios';
import {
  setError,
  setPending,
  getNotifications,
  addNotifications,
  deleteNotification,
} from '../redux/slice/notificationSlice';
const NOTIFI_API = 'https://stacklog.id.vn/api/notification';
import { REACT_API_URL } from "../api/apiConfig";

export const getAllNotification = async (token, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is not valid!'));
    dispatch(setPending(true));
    const response = await axios.get(`${REACT_API_URL}/notification/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // annotate REST-fetched notifications so UI can distinguish source
    const restNotifs = Array.isArray(response.data)
      ? response.data.map((n) => ({ ...n, __receivedVia: 'rest' }))
      : response.data;
    dispatch(getNotifications(restNotifs));
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
