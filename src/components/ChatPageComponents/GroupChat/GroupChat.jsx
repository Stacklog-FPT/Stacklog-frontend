import React, { useContext, useEffect, useState } from "react";
import avatar from "../../../assets/logo-login.png";
import "./GroupChat.scss";
import { useAuth } from "../../../context/AuthProvider";
import { ChatContext } from "../../../context/ChatContext";

const GroupChat = () => {
  const { setSelectedUser, setSelectedBox } = useContext(ChatContext);
  const [groupChatDetails, setGroupChatDetails] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const stackLog = {
      boxChat: {
        boxChatId: "1",
        nameBox: "StackLog",
        avaBox: avatar,
      },
      users: user?.token
        ? [
            {
              boxChatUserId: `u_${user.token.slice(-4)}`,
              id: user.token,
              name: "User",
            },
          ]
        : [],
      messages: [],
    };
    setGroupChatDetails([stackLog]);
  }, [user]);

  const handleUserClick = (user, boxDetail) => {
    setSelectedUser(user);
    setSelectedBox(boxDetail);
    console.log("Selected box:", boxDetail);
  };

  return (
    <div className="group__chat__container">
      <div className="group__chat__heading">
        <h2>Group chat</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="group__chat__list">
        {groupChatDetails.length === 0 ? (
          <p>Đang tải StackLog...</p>
        ) : (
          groupChatDetails.map((boxDetail) => (
            <div
              key={boxDetail.boxChat.boxChatId}
              className="group__chat__card"
              onClick={() => handleUserClick(null, boxDetail)}
            >
              <img src={boxDetail.boxChat?.avaBox || avatar} alt="avatar" />
              <div className="group__chat__card__content">
                <h2>{boxDetail.boxChat?.nameBox}</h2>
                <p>
                  {boxDetail.messages && boxDetail.messages.length > 0
                    ? boxDetail.messages[boxDetail.messages.length - 1]
                        .chatMessageContent
                    : "StackLog is ready to chat!"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupChat;
