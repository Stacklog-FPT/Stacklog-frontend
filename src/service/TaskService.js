import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import {
  getTasks,
  setPending,
  setError,
  deleteTask,
  setTasks,
  addTasks,
  updateTasks,
  resetTasks,
  getPersonalTask,
  updateReview,
} from '../redux/slice/taskSlice';
import { REACT_API_URL } from '../api/apiConfig';

const API_TASK = REACT_API_URL + 'task/task';
const SOCKET_URL = 'https://stacklog.id.vn/ws/taskify';
let stompClient = null;

export const setSocket = (token) => {
  if (!token) {
    throw new Error('Unauthorized!');
  }

  const socket = new SockJS(SOCKET_URL);
  stompClient = Stomp.over(socket);

  stompClient.connect(
    { Authorization: `Bearer ${token}` },
    () => {
      stompClient.subscribe('/topic/taskservice', (message) => {
        const data = JSON.parse(message.body);
      });
    },
    (error) => {
      console.error('STOMP connection error:', error);
    },
  );

  return stompClient;
};

export const getAllTask = async (token, groupId, dispatch) => {
  try {
    if (!token) dispatch(setError('Token is not valid or missing!'));
    dispatch(setPending(true));
    const response = await axios.get(`${API_TASK}/${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(response);
    dispatch(getTasks(response.data));
    dispatch(setPending(false));
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
  }
};

export const addTask = async (taskData, token, dispatch) => {
  if (!token) {
    throw new Error('Unauthorized!');
  }
  try {
    const response = await axios.post(`${API_TASK}/save`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(response);
    dispatch(addTasks(response.data));
    return response;
  } catch (e) {
    dispatch(setError(err.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const deleteTaskApi = async (token, taskId, dispatch) => {
  try {
    if (!token) {
      throw new Error('Unauthorized!');
    }
    dispatch(setPending(true));
    const response = await axios.delete(`${API_TASK}/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(deleteTask(taskId));
    dispatch(resetTasks());
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
    throw new Error(e.message);
  }
};

export const updateTaskApi = async (taskData, token, dispatch) => {
  try {
    console.log('Service call:', taskData);
    if (!token) dispatch(setError('The token is missing!'));
    const response = await axios.post(`${API_TASK}/save`, taskData, {
      //Change taskId before mockup with BE
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Call me update task: ', response);
    dispatch(updateTasks(response.data));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const createSubtaskApi = async (taskData, token, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is missing!'));
    const response = await axios.post(`${API_TASK}/subtask/save`, taskData, {
      //Change taskId before mockup with BE
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(updateTasks(response.data));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const getPersonalTaskApi = async (token, semesterId, dispatch) => {
  try {
    if (!token) {
      dispatch(setError('The token is invalid!'));
      throw new Error('The token is invalid!');
    }

    dispatch(setPending(true));
    const response = await axios.get(`${API_TASK}/personal-task?semesterId=${semesterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Personal Task: ', response);
    dispatch(getPersonalTask(response.data));
    dispatch(setPending(false));
  } catch (e) {
    dispatch(setError(e.message || 'Something went wrong!'));
  }
};

export const updateReviewApi = async (token, taskId, commentId, data, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is invalid!'));
    dispatch(setPending(true));

    const response = await axios.post(`${API_TASK}/save`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const changes = response.data;
    dispatch(updateReview({ taskId, commentId, changes }));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
  }
};
