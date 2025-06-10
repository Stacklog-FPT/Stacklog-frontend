import React, { useContext } from "react";
import "./ChatPage.scss";
import { ChatContext } from "../../context/ChatContext";
import phoneIcon from '../../asset../'
const ChatPage = () => {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="chat__page__container">
      <div className="chat__heading">
        <div className="chat__heading__left">
          <img src={selectedUser?.avatar} />
          <div className="chat__heading__userinfor">
            <h2>{selectedUser?.name}</h2>
          </div>
        </div>

        <div className="chat__heading__right"></div>
      </div>
    </div>
  );
};

export default ChatPage;
