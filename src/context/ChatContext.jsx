import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

export const ChatContext = createContext();

const socket = io("");
const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("users", (users) => {
      setUsers(users.filter((u) => u._id !== user_id));
    });

    socket.on("message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("users");
      socket.off("message");
    };
  }, []);
  return (
    <ChatContext.Provider
      value={{
        user,
        users,
        messages,
        setMessages,
        selectedUser,
        setSelectedUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
