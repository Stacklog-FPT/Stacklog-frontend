import React, { useContext, useEffect, useState, useRef } from "react";
import avatar from "../../../assets/logo-login.png";
import "./GroupChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3002";

const GroupChat = () => {
  const { setSelectedBox } = useContext(ChatContext);
  const [groupChatDetails, setGroupChatDetails] = useState([]);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  const socketRef = useRef(null);

  const { user } = useAuth();
  let currentUserId = "";
  if (user?.token) {
    try {
      const decoded = jwtDecode(user.token);
      currentUserId = decoded.id || decoded.email || decoded.username || "";
    } catch (e) {
      currentUserId = "";
    }
  }

  // Kết nối socket và lấy group
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    // Lấy danh sách group của user
    const fetchGroups = () => {
      socketRef.current.emit("getGroups", currentUserId, (groups) => {
        setGroupChatDetails(groups || []);
      });
    };

    fetchGroups();

    // Lắng nghe khi có group thay đổi
    socketRef.current.on("groupsUpdated", fetchGroups);

    return () => {
      socketRef.current.off("groupsUpdated", fetchGroups);
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [currentUserId]);

  // Xử lý chọn ảnh và preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setNewGroupAvatar(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewAvatar(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewAvatar(null);
    }
  };

  // Tạo group mới qua socket
  const handleAddGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    let avaBoxUrl = avatar;
    if (previewAvatar) {
      avaBoxUrl = previewAvatar;
    }

    const newGroup = {
      id: Date.now().toString(),
      boxChat: {
        boxChatId: Date.now().toString(),
        nameBox: newGroupName,
        avaBox: avaBoxUrl,
      },
      members: [currentUserId],
      messages: [],
    };

    socketRef.current.emit("createGroup", newGroup, (savedGroup) => {
      setShowAddGroup(false);
      setNewGroupName("");
      setNewGroupAvatar(null);
      setPreviewAvatar(null);
      setSelectedBox(savedGroup);
      // Không cần fetch lại, sẽ tự động cập nhật qua "groupsUpdated"
    });
  };

  const handleSelectGroup = (group) => {
    setSelectedBox(group);
  };

  return (
    <div className="group__chat__container">
      <div className="group__chat__header">
        <button className="btn-add-group" onClick={() => setShowAddGroup(true)}>
          <i className="fa-solid fa-plus"></i> Add Group
        </button>
      </div>
      {/* Popup Add Group */}
      {showAddGroup && (
        <div className="add-group-modal">
          <div className="add-group-modal-content">
            <div className="add-group-modal-header">
              <span>Tạo nhóm mới</span>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddGroup(false)}
              >
                &times;
              </button>
            </div>
            <form className="add-group-form" onSubmit={handleAddGroup}>
              <div className="add-group-avatar-upload">
                <label htmlFor="group-avatar-input" className="avatar-label">
                  <img
                    src={previewAvatar || avatar}
                    alt="avatar"
                    className="add-group-avatar-preview"
                  />
                  <span className="avatar-upload-text">Chọn ảnh</span>
                </label>
                <input
                  id="group-avatar-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <input
                type="text"
                placeholder="Group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
                className="add-group-input"
              />
              <div className="add-group-btns">
                <button type="submit" className="btn-create-group">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddGroup(false)}
                  className="btn-cancel-group"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
          <div
            className="add-group-modal-backdrop"
            onClick={() => setShowAddGroup(false)}
          ></div>
        </div>
      )}
      <div className="group__chat__list">
        {groupChatDetails.length === 0 ? (
          <p></p>
        ) : (
          groupChatDetails
            .filter((boxDetail) => boxDetail.members?.includes(currentUserId))
            .map((boxDetail) => (
              <div
                key={boxDetail.id}
                className="group__chat__card"
                onClick={() => handleSelectGroup(boxDetail)}
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
