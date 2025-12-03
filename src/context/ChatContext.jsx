"use client";

import { createContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import socketService from "../service/SocketService";
import { SOCKET_BASE_URL } from "../api/apiConfig";

export const ChatContext = createContext();

// Build socket URL for chat socket
// In dev: SOCKET_BASE_URL is '/api/' (relative) -> '/api/chat/socket.io' goes through Vite proxy
// In prod: SOCKET_BASE_URL is 'https://...' (absolute) -> direct connection
const SOCKET_URL = SOCKET_BASE_URL.replace(/\/$/, '') + '/chat/socket.io';
console.log('[ChatContext] SOCKET_BASE_URL:', SOCKET_BASE_URL, '-> SOCKET_URL:', SOCKET_URL);

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
  console.log('[ChatContext] Connecting socket with URL:', SOCKET_URL, 'token:', user?.token ? 'present' : 'missing');
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
