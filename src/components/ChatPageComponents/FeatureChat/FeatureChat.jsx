import React, { useContext } from "react";
import "./FeatureChat.scss";
import { ChatContext } from "../../../context/ChatContext";
const FeatureChat = () => {
  const { selectedUser } = useContext(ChatContext);
  return (
    <div className="feature__chat__container">
      <div className="feature__chat__heading">
        <h2>feature</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="feature__chat__user">
        <img src={selectedUser?.avatar} />
        <h2>{selectedUser?.name}</h2>
        <div className="feature__detail__class">
          <select>
            <option>
              <p>Common Class</p>
            </option>
          </select>

          <select>
            <option>
              <p>Common Team</p>
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FeatureChat;
