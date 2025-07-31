"use client";

import { useContext, useState } from "react";
import "./FeatureChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import defaulfAvatar from "../../../assets/logo-login.png";

const FeatureChat = () => {
  const { selectedUser, selectedBox, isFeatureChatOpen } =
    useContext(ChatContext);
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);

  const handleFeatureClick = (featureName) => {
    console.log(`${featureName} clicked`);
  };

  console.log("FeatureChat render, isFeatureChatOpen:", isFeatureChatOpen);

  if (!isFeatureChatOpen) {
    return null;
  }

  if (!selectedBox) {
    return (
      <div className="feature__chat__container">No chat data available</div>
    );
  }

  return (
    <div
      className={`feature__chat__container ${
        isFeatureChatOpen ? "visible" : ""
      }`}
    >
      <div className="feature__dropdown">
        <div
          className="feature__dropdown__heading"
          onClick={() => setIsFeatureOpen(!isFeatureOpen)}
        >
          <h2>Feature</h2>
          <i
            className={`fa-solid ${
              isFeatureOpen ? "fa-arrow-up" : "fa-arrow-down"
            }`}
          ></i>
        </div>

        {isFeatureOpen && (
          <div className="feature__menu">
            <div
              className="feature__menu__item"
              onClick={() => handleFeatureClick("Search message")}
            >
              <i className="fa-solid fa-search"></i>
              <span>Search message</span>
            </div>
            <div
              className="feature__menu__item"
              onClick={() => handleFeatureClick("Turn off notification")}
            >
              <i className="fa-solid fa-bell-slash"></i>
              <span>Turn off notification</span>
            </div>
            <div
              className="feature__menu__item"
              onClick={() => handleFeatureClick("Document")}
            >
              <i className="fa-solid fa-file-text"></i>
              <span>Document</span>
            </div>
            <div
              className="feature__menu__item"
              onClick={() => handleFeatureClick("Image")}
            >
              <i className="fa-solid fa-image"></i>
              <span>Image</span>
            </div>
            <div
              className="feature__menu__item"
              onClick={() => handleFeatureClick("Link")}
            >
              <i className="fa-solid fa-link"></i>
              <span>Link</span>
            </div>
            <div
              className="feature__menu__item"
              onClick={() => handleFeatureClick("Delete chat")}
            >
              <i className="fa-solid fa-trash"></i>
              <span>Delete chat</span>
            </div>
          </div>
        )}
      </div>

      <div className="feature__chat__user">
        <img
          src={
            defaulfAvatar ||
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" ||
            "/placeholder.svg" ||
            "/placeholder.svg" ||
            "/placeholder.svg" ||
            "/placeholder.svg"
          }
          alt="User Avatar"
          onError={(e) =>
            (e.target.src =
              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
          }
        />
        <h2>{selectedBox?.boxChat?.nameBox || "No Chat Selected"}</h2>
        <div className="feature__detail__class">
          <div className="team-selection">
            <p>Common Team</p>
            <div className="team-members">
              {selectedBox?.users?.length > 0 ? (
                selectedBox.users.map((user) => (
                  <div key={user.boxChatUserId} className="team-member">
                    <div className="team-member-avatar">
                      <img
                        src={
                          user.avatar ||
                          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={`${user.name}'s Avatar`}
                        onError={(e) =>
                          (e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                        }
                      />
                      <div className="status-indicator"></div>
                    </div>
                    <div className="team-member-info">
                      <div className="team-member-name">{user.name}</div>
                      <div className="team-member-since">
                        Member since {user.memberSince || "Feb 2022"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No members available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureChat;
