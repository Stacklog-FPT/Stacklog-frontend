import { createContext, useState } from "react";

export const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <ChatContext.Provider value={{ selectedUser, setSelectedUser }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
