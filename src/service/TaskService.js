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
} from '../redux/slice/taskSlice';

const API_TASK = 'https://stacklog.id.vn/api/task';
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
    const response = await axios.get(`http://localhost:3001/task?group_id=${groupId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(getTasks(response.data));
    dispatch(setPending(false));
  } catch (e) {
    dispatch(setError(err.message));
    dispatch(setPending(false));
  }
};

export const addTask = async (taskData, token, dispatch) => {
  if (!token) {
    throw new Error('Unauthorized!');
  }
  try {
    const response = await axios.post(`http://localhost:3001/task`, taskData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch(addTasks(response.data));
    return response;
  } catch (e) {
    dispatch(setError(err.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const deleteTaskApi = async (token, taskId, dispatch) => {
  if (!token) {
    throw new Error('Unauthorized!');
  }
  try {
    const response = await axios.delete(`http://localhost:3001/task/${taskId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    dispatch(deleteTask(taskId));
    return response;
  } catch (e) {
    dispatch(setError(err.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const updateTaskApi = async (taskData, token, dispatch) => {
  try {
    if (!token) dispatch(setError('The token is missing!'));
    const response = await axios.put(`http://localhost:3001/task/${taskData.id}`, taskData, {
      //Change taskId before mockup with BE
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('Call me: ', response.data);
    dispatch(updateTasks(response.data));
    dispatch(setPending(false));
    return response;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const getTaskBySelf = async (token, userId, dispatch) => {
  try {
    if (!token) {
      dispatch(setError('The token is invalid!'));
      throw new Error('The token is invalid!');
    }

    dispatch(setPending(true));

    const response = await axios.get(``);
  } catch (e) {
    dispatch(setError(e.message || 'Something went wrong!'));
  }
};
