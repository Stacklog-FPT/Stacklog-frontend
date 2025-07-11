import React, { useContext } from "react";
import "./FeatureChat.scss";
import { ChatContext } from "../../../context/ChatContext";

const FeatureChat = () => {
  const { selectedUser } = useContext(ChatContext);
  console.log(selectedUser);

  return (
    <div className="feature__chat__container">
      <div className="feature__chat__heading">
        <h2>feature</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="feature__chat__user">
        <img
          src={
            selectedUser?.avatar ||
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
          }
          alt="User Avatar"
        />
        <h2>{selectedUser?.name || "Không có tên"}</h2>
        <div className="feature__detail__class">
          <div className="class-selection">
            <p>Common Class</p>
          </div>
          <div className="team-selection">
            <p>Common Team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureChat;
