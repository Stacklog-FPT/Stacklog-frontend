import axios from "axios";
const CHAT_API = "http://103.166.183.142:8080/api/chat";

const ChatBoxApi = () => {
  // Lấy danh sách các box chat
  const getBoxChat = async (token) => {
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    try {
      const response = await axios.get(`${CHAT_API}/box-chat`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Get Box Chat API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Tạo box chat mới
  const createBoxChat = async (token) => {
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    try {
      const response = await axios.post(
        `${CHAT_API}/box-chat`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Create Box Chat API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Lấy danh sách user của một box chat
  const getBoxChatUserList = async (token, boxChatId) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      const response = await axios.get(
        `${CHAT_API}/box-chat-user/${boxChatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Get Box Chat User List API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Lấy danh sách tin nhắn của một box chat
  const getBoxChatMessages = async (token, boxChatId) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!boxChatId) throw new Error("Missing boxChatId");
    try {
      const response = await axios.get(
        `${CHAT_API}/chat-message/${boxChatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Get Box Chat Messages API failed:",
        error?.response || error.message
      );
      throw error;
    }
  };

  // Lấy danh sách user và tin nhắn của tất cả box chat
  const getAllBoxChatUserDetails = async (token) => {
  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }
  try {
    const boxChats = await getBoxChat(token); 
    const allDetails = await Promise.all(
      boxChats.map(async (box) => {
        const [users, messages] = await Promise.all([
          getBoxChatUserList(token, box.boxChatId),
          getBoxChatMessages(token, box.boxChatId),
        ]);
        // Lấy tin nhắn cuối cùng (hoặc đầu tiên tuỳ ý)
        const chatMessageContent =
          messages && messages.length > 0
            ? messages[messages.length - 1].chatMessageContent
            : "";
        return {
          boxChat: box,
          users,
          messages,
          chatMessageContent, // Thêm trường này vào object trả về
        };
      })
    );
    return allDetails;
  } catch (error) {
    console.error(
      "Get All Box Chat User Details failed:",
      error?.response || error.message
    );
    throw error;
  }
};

  return {
    getBoxChat,
    createBoxChat,
    getBoxChatUserList,
    getBoxChatMessages,
    getAllBoxChatUserDetails,
  };
};

export default ChatBoxApi;