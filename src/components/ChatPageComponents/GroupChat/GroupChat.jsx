import React, { useState } from "react";
import "./GroupChat.scss";
const GroupChat = () => {
  const [groupChat, setGroupChat] = useState([
    { id: 1, avatar: "", name: "", content: "", isRead: true },
    { id: 2, avatar: "", name: "", content: "", isRead: true },
    { id: 3, avatar: "", name: "", content: "", isRead: false },
    { id: 4, avatar: "", name: "", content: "", isRead: false },
  ]);
  return (
    <div className="group__chat__container">
      <div className="group__chat__heading">
        <h2>Group chat</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="group__chat__list">{groupChat.map((item) => {
        
      })}</div>
    </div>
  );
};

export default GroupChat;
