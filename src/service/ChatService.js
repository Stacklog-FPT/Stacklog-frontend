import axios from "axios";
import { REACT_API_URL } from "../api/apiConfig";
import {
  apiStart,
  apiSuccess,
  apiFailure,
  setBoxes,
  setBox,
  setMessages,
  addMessage,
} from "../redux/slice/chatSlice";

const ChatBoxApi = () => {
  // Lấy danh sách box chat (endpoint: /boxes)
  const getBoxes = async (token, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    try {
      if (dispatch) dispatch(apiStart());
      const response = await axios.get(`${REACT_API_URL}/chat/boxes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      if (dispatch) {
        try {
          dispatch(setBoxes(Array.isArray(data) ? data : data || []));
        } catch (e) {
          // swallow mapping errors so callers still get response
        }
        dispatch(apiSuccess());
      }
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error("Get Boxes API failed:", error?.response || error.message);
      throw error;
    }
  };

  // Tạo box chat mới (POST /boxes)
  const createBox = async (token, payload, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!payload) throw new Error("Missing payload");
    try {
      if (dispatch) dispatch(apiStart());
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
      const data = response.data;
      if (dispatch) {
        try {
          dispatch(setBox(data));
        } catch (e) {}
        dispatch(apiSuccess());
      }
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error("Create Box API failed:", error?.response || error.message);
      throw error;
    }
  };

  // Cập nhật memberIds của box chat (PATCH /boxes/{boxChatId})
  const updateBoxMembers = async (token, boxChatId, payload, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    if (!payload) throw new Error("Missing payload");
    try {
      if (dispatch) dispatch(apiStart());
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
      const data = response.data;
      if (dispatch) {
        try {
          dispatch(setBox(data));
        } catch (e) {}
        dispatch(apiSuccess());
      }
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error(
        "Update Box Members API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Gửi tin nhắn vào box chat (POST /messages/{boxChatId})
  const sendMessage = async (token, boxChatId, payload, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    if (!payload) throw new Error("Missing payload");
    try {
      if (dispatch) dispatch(apiStart());
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
      const data = response.data;
      if (dispatch) {
        try {
          // let reducer decide how to merge/dedupe
          dispatch(addMessage({ boxId: boxChatId, message: data }));
        } catch (e) {}
        dispatch(apiSuccess());
      }
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error(
        "Send Message API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Lấy danh sách tin nhắn của box chat (GET /messages/{boxChatId})
  const getMessages = async (token, boxChatId, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      if (dispatch) dispatch(apiStart());
      const response = await axios.get(
        `${REACT_API_URL}/chat/messages/${boxChatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data;
      if (dispatch) {
        try {
          dispatch(setMessages({ boxId: boxChatId, messages: data }));
        } catch (e) {}
        dispatch(apiSuccess());
      }
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error(
        "Get Messages API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Đánh dấu các tin nhắn trong box chat là đã đọc (PUT /messages/read/{boxChatId})
  const markMessagesRead = async (token, boxChatId, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      // server endpoint to mark messages in a box as read
      if (dispatch) dispatch(apiStart());
      const response = await axios.post(
        `${REACT_API_URL}/chat/messages/read/${boxChatId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (dispatch) dispatch(apiSuccess());
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error("Mark Messages Read API failed:", error?.response || error.message);
      throw error;
    }
  };

  const recallMessage = async (token, messageId, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!messageId) throw new Error("Missing messageId");
    try {
      if (dispatch) dispatch(apiStart());
      const response = await axios.put(
        `${REACT_API_URL}/chat/messages/recall/${messageId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (dispatch) dispatch(apiSuccess());
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error(
        "Recall Message API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Xoá một message (DELETE /{messageId})
  const deleteMessage = async (token, messageId, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!messageId) throw new Error("Missing messageId");
    try {
      if (dispatch) dispatch(apiStart());
      const response = await axios.delete(
        `${REACT_API_URL}/chat/messages/${messageId}?hard=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      if (dispatch) dispatch(apiSuccess());
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error(
        "Delete Message API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Xoá box chat (DELETE /boxes/{boxChatId})
  const deleteBox = async (token, boxChatId, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      if (dispatch) dispatch(apiStart());
      const response = await axios.delete(
        `${REACT_API_URL}/chat/boxes/${boxChatId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = response.data;
      if (dispatch) dispatch(apiSuccess());
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error("Delete Box API failed:", error?.response || error.message);
      throw error;
    }
  };

  // Xoá member khỏi box chat (DELETE /boxes/{boxChatId}/delete/{memberId})
  const deleteBoxMember = async (token, boxChatId, memberId, dispatch) => {
    if (!token) throw new Error('Unauthorized: No token provided');
    if (!boxChatId) throw new Error('Missing boxChatId');
    if (!memberId) throw new Error('Missing memberId');
    try {
      if (dispatch) dispatch(apiStart());
      const response = await axios.delete(
        `${REACT_API_URL}/chat/boxes/${boxChatId}/delete/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = response.data;
      if (dispatch) dispatch(apiSuccess());
      return data;
    } catch (error) {
      if (dispatch) dispatch(apiFailure(error?.message || error));
      console.error('Delete Box Member API failed:', error?.response || error.message);
      throw error;
    }
  };

  return {
    getBoxes,
    createBox,
    updateBoxMembers,
    sendMessage,
    getMessages,
    markMessagesRead,
    recallMessage,
    deleteMessage,
    deleteBox,
    deleteBoxMember,
  };
};

export default ChatBoxApi;
