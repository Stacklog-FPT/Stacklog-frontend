"use client";

import { createContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import socketService from "../service/SocketService";
import { REACT_API_URL } from "../api/apiConfig";

export const ChatContext = createContext();

let apiOrigin = REACT_API_URL;
try {
  apiOrigin = new URL(REACT_API_URL).origin;
} catch (e) {
  apiOrigin = REACT_API_URL.replace(/\/.*$/, "");
}
const socketScheme = apiOrigin.replace(/^https/, "wss");
const SOCKET_URL = socketScheme + "/api/chat/socket.io";

const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [messages, setMessages] = useState([]);
  const [boxesVersion, setBoxesVersion] = useState(0);

  const [isFeatureChatOpen, setIsFeatureChatOpen] = useState(false);

  const toggleFeatureChat = () => {
    setIsFeatureChatOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!user) return;

  // connect shared socket (kept for app lifetime). Pass token in auth to avoid
  // serializing userId=undefined into the handshake URL when user id is not present yet.
  socketService.connect({ url: SOCKET_URL, token: user?.token });

    const handleUsers = (incoming) => {
      setUsers(incoming.filter((u) => u._id !== user?._id));
    };
    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    socketService.on("users", handleUsers);
    socketService.on("message", handleMessage);

    return () => {
      socketService.off("users", handleUsers);
      socketService.off("message", handleMessage);
    };
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        user,
        users,
        messages,
        setMessages,
        selectedUser,
        setSelectedUser,
        selectedBox,
          setSelectedBox,
          boxesVersion,
          setBoxesVersion,
        isFeatureChatOpen,
        setIsFeatureChatOpen,
        toggleFeatureChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
