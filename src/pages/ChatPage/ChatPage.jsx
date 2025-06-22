import React, { useContext } from "react";
import "./ChatPage.scss";
import { ChatContext } from "../../context/ChatContext";
import errorIcon from "../../assets/chatPageIcon/error.png";
import fileIcon from "../../assets/chatPageIcon/file_open.png";
import attachmentIcon from "../../assets/chatPageIcon/attachment.png";
import smileIcon from "../../assets/chatPageIcon/smile.png";
import FeatureChat from "../../components/ChatPageComponents/FeatureChat/FeatureChat";
const ChatPage = () => {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="main__chat__page">
      <div className="chat__page__container">
        <div className="chat__heading">
          <div className="chat__heading__left">
            <img
              src={
                selectedUser?.avatar
                  ? selectedUser?.avatar
                  : "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
              }
            />
            <div className="chat__heading__userinfor">
              <h2>{selectedUser?.name}</h2>
            </div>
            {selectedUser?.isOnline && <div className="online_dot"></div>}
          </div>

          <div className="chat__heading__right">
            <i className="fa-solid fa-phone"></i>
            <i className="fa-solid fa-video"></i>
          </div>
        </div>
        <div className="chat__content">
          {/* Nội dung chat chắc nằm đây, chưa biết làm! */}
          <p>Cơ bản là nhắn tin ở đây từ từ có! OKE?</p>
        </div>
        <div className="chat__footer">
          <input type="text" placeholder="Send a message" />
          <div className="chat__footer__feature">
            <div className="wrapper__feature">
              <img src={errorIcon} alt="icon..." />
              <img src={fileIcon} alt="icon..." />
              <img src={attachmentIcon} alt="icon..." />
              <img src={smileIcon} alt="icon..." />
            </div>
            <div className="send__message">
              <i className="fa-regular fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
      <FeatureChat />
    </div>
  );
};

export default ChatPage;
