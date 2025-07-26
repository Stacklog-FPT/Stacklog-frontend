import React, { useContext, useState, useEffect } from "react";
import avatar from "../../../assets/ava-chat.png";
import "./GroupChat.scss";
import { useAuth } from "../../../context/AuthProvider";
import { ChatContext } from "../../../context/ChatContext";
import ChatBoxApi from "../../../service/ChatService";

const GroupChat = () => {
  const { setSelectedUser, setSelectedBox } = useContext(ChatContext);
  const [groupChatDetails, setGroupChatDetails] = useState([]);
  const { user } = useAuth();

  // Lấy danh sách user và tin nhắn của tất cả box chat
  const fetchAllBoxChatUsers = async () => {
    try {
      const api = ChatBoxApi();
      const data = await api.getAllBoxChatUserDetails(user.token);
      setGroupChatDetails(data); // [{ boxChat, users, messages }]
    } catch (error) {
      console.error("Failed to fetch group chat users:", error);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchAllBoxChatUsers();
    }
  }, [user]);

  // Truyền cả user và box chat vào context
  const handleUserClick = (user, boxDetail) => {
    setSelectedUser(user);
    setSelectedBox(boxDetail);
  };

  return (
    <div className="group__chat__container">
      <div className="group__chat__heading">
        <h2>Group chat</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="group__chat__list">
        {groupChatDetails.map((boxDetail) =>
          boxDetail.users.map((item) => (
            <div
              key={item.boxChatUserId}
              className="group__chat__card"
              onClick={() => handleUserClick(item, boxDetail)}
            >
              <img src={boxDetail.boxChat?.avaBox || avatar} alt="avatar" />
              <div className="group__chat__card__content">
                <h2>{boxDetail.boxChat?.nameBox}</h2>
                <p>
                  {boxDetail.messages && boxDetail.messages.length > 0
                    ? boxDetail.messages[boxDetail.messages.length - 1].chatMessageContent
                    : ""}
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