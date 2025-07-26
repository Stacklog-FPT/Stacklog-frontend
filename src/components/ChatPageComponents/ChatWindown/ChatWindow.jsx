import React, { useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";
import errorIcon from "../../../assets/chatPageIcon/error.png";
import fileIcon from "../../../assets/chatPageIcon/file_open.png";
import attachmentIcon from "../../../assets/chatPageIcon/attachment.png";
import smileIcon from "../../../assets/chatPageIcon/smile.png";
import avatarDefault from "../../../assets/ava-chat.png";
import "./ChatWindow.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";

const ChatWindow = () => {
  const { selectedUser, selectedBox } = useContext(ChatContext);
  const { user } = useAuth();
  const [myMessage, setMyMessage] = useState("");

  // Giải mã token để lấy id
  let myId = "";
  if (user?.token) {
    try {
      const decoded = jwtDecode(user.token);
      myId = decoded.id;
    } catch (error) {
      myId = "";
    }
  }

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const onSend = () => {
    if (myMessage.trim()) {
      alert("This is your message: " + myMessage);
    }
  };
  console.log("selectedUser", selectedUser?.avatar);
  console.log("user", myId);
  return (
    <div className="chat__window">
      <div className="chat__page__container">
        <div className="chat__heading">
          <div className="chat__heading__left">
            <img src={selectedBox?.boxChat?.avaBox} alt="avatar" />
            <div className="chat__heading__userinfor">
              <h2>{selectedBox?.boxChat?.nameBox}</h2>
            </div>
            {selectedUser?.isOnline && <div className="online_dot"></div>}
          </div>
          <div className="chat__heading__right">
            <i className="fa-solid fa-phone"></i>
            <i className="fa-solid fa-video"></i>
          </div>
        </div>
        <div className="chat__content chat__content--scroll">
          {selectedBox &&
          selectedBox.messages &&
          selectedBox.messages.length > 0 ? (
            [...selectedBox.messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg) => {
                const isMe = msg.createdBy === myId;
                return (
                  <div
                    key={msg.chatMessageId}
                    className={`chat__message__row ${
                      isMe
                        ? "chat__message__row--right"
                        : "chat__message__row--left"
                    }`}
                  >
                    {!isMe && (
                      <img
                        className="chat__message__avatar"
                        src={selectedUser?.avatar}
                        alt="avatar"
                      />
                    )}
                    <div
                      className={`chat__message ${
                        isMe ? "chat__message--right" : "chat__message--left"
                      }`}
                    >
                      <div className="chat__message__info">
                        <span className="chat__message__name">
                          {isMe ? "You" : selectedUser?.name || "User"}
                        </span>
                        <span className="chat__message__time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div className="chat__message__content">
                        {msg.chatMessageContent}
                      </div>
                    </div>
                    {isMe && (
                      <img
                        className="chat__message__avatar"
                        src={user?.avatar}
                        alt="avatar"
                      />
                    )}
                  </div>
                );
              })
          ) : (
            <p>No messages</p>
          )}
        </div>
        <div className="chat__footer">
          <input
            type="text"
            placeholder="Send a message"
            value={myMessage}
            onChange={(e) => setMyMessage(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onSend()}
          />
          <div className="chat__footer__feature">
            <div className="wrapper__feature">
              <img src={errorIcon} alt="icon..." />
              <img src={fileIcon} alt="icon..." />
              <img src={attachmentIcon} alt="icon..." />
              <img src={smileIcon} alt="icon..." />
            </div>
            <div className="send__message" onClick={onSend}>
              <i className="fa-regular fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
