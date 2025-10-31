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
    if (!token) {
      dispatch(setError('The token is not valid!'));
      return [];
    }
    dispatch(setPending(true));
    const response = await axios.get(`${REACT_API_URL}/notification/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const restNotifs = Array.isArray(response.data) ? response.data : [];

    // map server shape to UI-friendly shape
    const mapped = restNotifs.map((n) => ({
      id: n._id || n.id,
      title: n.content || n.title || '',
      createdAt: n.createdAt,
      starred: false,
      receivers: n.receivers || [],
      __receivedVia: 'rest',
      path: n.path || '',
    }));

    dispatch(getNotifications(mapped));
    dispatch(setPending(false));
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e?.message || 'Something went wrong!'));
    throw e;
  }
};

export const createNotification = async (token, data, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is not valid!'));
    dispatch(setPending(true));
    const response = await axios.post(`${REACT_API_URL}/notification/`, data, {
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

    const response = await axios.delete(`${REACT_API_URL}/notification/${id}`, {
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

export const sendNotificationToClasses = async (token, body, dispatch) => {
  try {
    if (!token) {
      dispatch(setError('The token is not valid!'));
      return null;
    }
    dispatch(setPending(true));

    const response = await axios.post(
      `${REACT_API_URL}/notification/sendnoti`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // server may return created notification(s) or a status object
    const data = response?.data;
    // if single notification returned, add to store; if array, add each
    if (data) {
      if (Array.isArray(data)) {
        data.forEach((n) => dispatch(addNotifications(n)));
      } else {
        // dispatch single item
        dispatch(addNotifications(data));
      }
    }

    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setPending(false));
    dispatch(setError(e?.message || 'Failed to send notification'));
    throw e;
  }
};
