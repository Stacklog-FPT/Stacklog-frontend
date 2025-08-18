import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import axios from 'axios';
import { getTasks, setPending, setError } from '../redux/slice/taskSlice';

const API_TASK = 'https://stacklog.id.vn/api/task';
const SOCKET_URL = 'https://stacklog.id.vn/ws/taskify';

const taskService = () => {
  let stompClient = null;

  const setSocket = (token) => {
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

  const getAllTask = async (token, groupId, dispatch) => {
    try {
      if (!token) dispatch(setError('Token is not valid or missing!'));

      dispatch(setPending(true));
      const response = await axios.get(`http://localhost:3001/task?group_id=${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('debug task service: ', response);

      dispatch(getTasks(response.data));
      dispatch(setPending(false));
    } catch (e) {
      dispatch(setError(err.message));
      dispatch(setPending(false));
    }
  };

  const addTask = async (taskData, token) => {
    if (!token) {
      throw new Error('Unauthorized!');
    }
    try {
      const response = await axios.post(`${API_TASK}/task`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const deleteTask = async (token, taskId) => {
    if (!token) {
      throw new Error('Unauthorized!');
    }

    try {
      const response = await axios.delete(`${API_TASK}/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return { getAllTask, addTask, deleteTask, setSocket };
};

export default taskService;
