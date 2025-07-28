import React, { useContext, useState, useEffect } from "react";
import "./FeatureChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import defaulfAvatar from "../../../assets/logo-login.png";

const FeatureChat = () => {
  const { selectedUser, selectedBox, setSelectedBox } = useContext(ChatContext);
  const [isTeamOpen, setIsTeamOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const response = await fetch("http://localhost:3001/0");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSelectedBox(Array.isArray(data) ? data[0] : data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchChatData();
  }, [setSelectedBox]);

  if (loading) {
    return <div className="feature__chat__container">Loading...</div>;
  }

  if (error) {
    return <div className="feature__chat__container">Error: {error}</div>;
  }

  return (
    <div className="feature__chat__container">
      <div className="feature__chat__heading">
        <h2>Feature</h2>
        <i className="fa-solid fa-arrow-down"></i>
      </div>
      <div className="feature__chat__user">
        <img
          src={
            defaulfAvatar ||
            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
          }
          alt="User Avatar"
          onError={(e) =>
            (e.target.src =
              "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
          }
        />
        <h2>{selectedBox?.boxChat?.nameBox || "No Chat Selected"}</h2>
        <div className="feature__detail__class">
          <div className="class-selection">
            <p>Common Class</p>
          </div>
          <div
            className="team-selection"
            role="button"
            aria-label="Toggle team members"
            tabIndex={0}
            onClick={() => setIsTeamOpen(!isTeamOpen)}
            onKeyDown={(e) => e.key === "Enter" && setIsTeamOpen(!isTeamOpen)}
          >
            <p>Common Team</p>
            {isTeamOpen && (
              <div className="team-members">
                {selectedBox?.users?.length > 0 ? (
                  selectedBox.users.map((user) => (
                    <div key={user.boxChatUserId} className="team-member">
                      <img
                        src={
                          user.avatar ||
                          "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                        }
                        alt={`${user.name}'s Avatar`}
                        onError={(e) =>
                          (e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                        }
                      />
                      <span>{user.name}</span>
                    </div>
                  ))
                ) : (
                  <p>No members available</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureChat;
