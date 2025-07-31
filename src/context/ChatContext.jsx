"use client";

import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

export const ChatContext = createContext();

const socket = io("");

const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [messages, setMessages] = useState([]);

  const [isFeatureChatOpen, setIsFeatureChatOpen] = useState(false);

  const toggleFeatureChat = () => {
    setIsFeatureChatOpen((prev) => {
      return !prev;
    });
  };

  useEffect(() => {
    socket.on("users", (users) => {
      setUsers(users.filter((u) => u._id !== user?._id));
    });

    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("users");
      socket.off("message");
    };
  }, [user?._id]);

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
