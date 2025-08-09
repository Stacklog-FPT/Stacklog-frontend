import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axios from "axios";

const API_TASK = "https://stacklog.id.vn/api/task";
const SOCKET_URL = "https://stacklog.id.vn/ws/taskify";

const taskService = () => {
  let stompClient = null;

  const setSocket = (token) => {
    if (!token) {
      throw new Error("Unauthorized!");
    }

    const socket = new SockJS(SOCKET_URL);
    stompClient = Stomp.over(socket);

    stompClient.connect(
      { Authorization: `Bearer ${token}` },
      () => {
        stompClient.subscribe("/topic/taskservice", (message) => {
          const data = JSON.parse(message.body);
        });
      },
      (error) => {
        console.error("STOMP connection error:", error);
      }
    );

    return stompClient;
  };

  const getAllTask = async (token, groupId) => {
    if (!token) {
      throw new Error("Unauthorized!");
    }
    try {
      const response = await axios.get(`${API_TASK}/task/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const addTask = async (taskData, token) => {
    if (!token) {
      throw new Error("Unauthorized!");
    }
    try {
      const response = await axios.post(`${API_TASK}/task`, taskData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const deleteTask = async (token, taskId) => {
    if (!token) {
      throw new Error("Unauthorized!");
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
