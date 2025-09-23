import axios from "axios";
import { REACT_API_URL } from "../api/apiConfig";

const ChatBoxApi = () => {
  // Lấy danh sách box chat (endpoint: /boxes)
  const getBoxes = async (token) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    try {
      const response = await axios.get(`${REACT_API_URL}/chat/boxes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Get Boxes API failed:", error?.response || error.message);
      throw error;
    }
  };

  // Tạo box chat mới (POST /boxes)
  const createBox = async (token, payload) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!payload) throw new Error("Missing payload");
    try {
      const response = await axios.post(
        `${REACT_API_URL}/chat/boxes`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Create Box API failed:", error?.response || error.message);
      throw error;
    }
  };

  // Cập nhật memberIds của box chat (PATCH /boxes/{boxChatId})
  const updateBoxMembers = async (token, boxChatId, payload) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    if (!payload) throw new Error("Missing payload");
    try {
      const response = await axios.post(
        `${REACT_API_URL}/chat/boxes/${boxChatId}/members`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Update Box Members API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Gửi tin nhắn vào box chat (POST /messages/{boxChatId})
  const sendMessage = async (token, boxChatId, payload) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    if (!payload) throw new Error("Missing payload");
    try {
      const response = await axios.post(
        `${REACT_API_URL}/chat/messages/${boxChatId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Send Message API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Lấy danh sách tin nhắn của box chat (GET /messages/{boxChatId})
  const getMessages = async (token, boxChatId) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      const response = await axios.get(
        `${REACT_API_URL}/chat/messages/${boxChatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Get Messages API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  const recallMessage = async (token, messageId) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!messageId) throw new Error("Missing messageId");
    try {
      const response = await axios.put(
        `${REACT_API_URL}/chat/messages/recall/${messageId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Recall Message API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Xoá một message (DELETE /{messageId})
  const deleteMessage = async (token, messageId) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!messageId) throw new Error("Missing messageId");
    try {
      const response = await axios.delete(
        `${REACT_API_URL}/chat/messages/${messageId}?hard=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Delete Message API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Xoá box chat (DELETE /boxes/{boxChatId})
  const deleteBox = async (token, boxChatId) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      const response = await axios.delete(
        `${REACT_API_URL}/chat/boxes/${boxChatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Delete Box API failed:", error?.response || error.message);
      throw error;
    }
  };

  return {
    getBoxes,
    createBox,
    updateBoxMembers,
    sendMessage,
    getMessages,
    recallMessage,
    deleteMessage,
    deleteBox,
  };
};

export default ChatBoxApi;
