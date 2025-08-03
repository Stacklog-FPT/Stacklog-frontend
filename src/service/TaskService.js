import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import axios from "axios";

const API_TASK = "http://103.166.183.142:8080/api/task";
const SOCKET_URL = "http://103.166.183.142/ws/taskify";

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

    console.log('From service: ', groupId)
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
      console.log(response);
      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return { getAllTask, addTask, setSocket };
};

export default taskService;
