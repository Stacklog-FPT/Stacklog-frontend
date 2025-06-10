import React, { useState } from "react";
import "./RecentChat.scss";
import avatar from "../../../assets/ava-chat.png";
const RecentChat = () => {
  const [recentChat, setRecentChat] = useState([
    {
      id: 1,
      avatar: avatar,
      name: "Maeve",
      content: "Hello there, hangout?",
      isRead: true,
      isOnline: true,
    },
    {
      id: 2,
      avatar: avatar,
      name: "Adam Groff",
      content: "Oh hello, billard?",
      isRead: true,
      isOnline: true,
    },
    {
      id: 3,
      avatar: avatar,
      name: "Eric",
      content: "Hello, have time?",
      isRead: false,
      isOnline: false,
    },
    {
      id: 4,
      avatar: avatar,
      name: "Otis Milburn",
      content: "Opps, goodBye",
      isRead: false,
      isOnline: false,
    },
    // {
    //   id: 5,
    //   avatar: avatar,
    //   name: "Otis Milburn",
    //   content: "Opps, goodBye",
    //   isRead: false,
    // },
    // {
    //   id: 6,
    //   avatar: avatar,
    //   name: "Otis Milburn",
    //   content: "Opps, goodBye",
    //   isRead: false,
    // },
  ]);
  return (
    <div className="recent__chat__container">
      <div className="recent__chat__heading">
        <h2>recent chat</h2>
      </div>
      <div className="recent__chat__list">
        {recentChat.map((item) => {
          return (
            <div
              key={item.id}
              className={`recent__chat__card${item.isRead ? " isRead" : ""}`}
            >
              <img src={item.avatar} alt="avatar" />
              <div className="recent__chat__card__content">
                <h2>{item.name}</h2>
                <p>{item.content}</p>
              </div>
              {item.isOnline && <div className="online_dot"></div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentChat;
