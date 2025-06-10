import React, { useContext, useState } from "react";
import avatar from "../../../assets/ava-chat.png";
import "./GroupChat.scss";
import { ChatContext } from "../../../context/ChatContext";
const GroupChat = () => {
  const { setSelectedUser } = useContext(ChatContext);
  const [groupChat, setGroupChat] = useState([
    {
      id: 1,
      avatar: avatar,
      name: "Maeve",
      content: "Hello there, hangout?",
      isRead: true,
    },
    {
      id: 2,
      avatar: avatar,
      name: "Adam Groff",
      content: "Oh hello, billard?",
      isRead: true,
    },
    {
      id: 3,
      avatar: avatar,
      name: "Eric",
      content: "Hello, have time?",
      isRead: false,
    },
    {
      id: 4,
      avatar: avatar,
      name: "Otis Milburn",
      content: "Opps, goodBye",
      isRead: false,
    },
  ]);

  const handleUserClick = (user) => {
    setSelectedUser(user);
  };
  return (
    <div className="group__chat__container">
      <div className="group__chat__heading">
        <h2>Group chat</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="group__chat__list">
        {groupChat.map((item) => {
          return (
            <div
              key={item.id}
              className={`group__chat__card${item.isRead ? " isRead" : ""}`}
              onClick={() => handleUserClick(item)}
            >
              <img src={item.avatar} alt="avatar" />
              <div className="group__chat__card__content">
                <h2>{item.name}</h2>
                <p>{item.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GroupChat;
