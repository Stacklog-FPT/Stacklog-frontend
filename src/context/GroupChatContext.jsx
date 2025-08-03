import { createContext, useState } from "react";

export const GroupChatContext = createContext();

export const GroupChatProvider = ({ children }) => {
  const [isShowGroupChat, setIsShowGroupChat] = useState(false);

  const toggleGroupChat = () => {
    setIsShowGroupChat(!isShowGroupChat);
  };

  return (
    <GroupChatContext.Provider
      value={{ isShowGroupChat, toggleGroupChat, setIsShowGroupChat }} 
    >
      {children}
    </GroupChatContext.Provider>
  );
};

export default GroupChatProvider;
