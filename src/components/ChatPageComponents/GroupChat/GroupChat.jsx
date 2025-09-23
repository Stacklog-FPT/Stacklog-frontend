import React, { useContext, useEffect, useState, useRef } from "react";
import avatar from "../../../assets/logo-login.png";
import "./GroupChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
import chatApi from "../../../service/ChatService";

const GroupChat = ({ showAddGroup: externalShowAddGroup, setShowAddGroup: externalSetShowAddGroup, defaultBoxType }) => {
  const { setSelectedBox } = useContext(ChatContext);
  const [groupChatDetails, setGroupChatDetails] = useState([]);
  const [localShowAddGroup, setLocalShowAddGroup] = useState(false);
  const showAddGroup = externalShowAddGroup !== undefined ? externalShowAddGroup : localShowAddGroup;
  const setShowAddGroup = externalSetShowAddGroup !== undefined ? externalSetShowAddGroup : setLocalShowAddGroup;
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  // socketRef removed: this component now loads boxes via REST (`getBoxes`)

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

  // Load groups via REST API (getBoxes)
  useEffect(() => {
    const service = chatApi();
    let mounted = true;

    const fetchGroups = async () => {
      if (!user?.token) {
        if (mounted) setGroupChatDetails([]);
        return;
      }
      try {
        const boxes = await service.getBoxes(user.token);
        // Map server shape to component shape used elsewhere in the UI
        const mapped = (boxes || []).map((b) => {
          // members may be an array of member objects ({ userId, ... }) or an array of ids
          let members = [];
          if (Array.isArray(b.memberIds) && b.memberIds.length) {
            members = b.memberIds;
          } else if (Array.isArray(b.members) && b.members.length) {
            // members could be [{ userId: '...' }, ...]
            members = b.members.map((m) => m.userId || m.user_id).filter(Boolean);
          } else {
            members = [currentUserId].filter(Boolean);
          }

          // keep original member objects when server provides them
          const memberObjects = Array.isArray(b.members) && b.members.length ? b.members : undefined;

          return {
            id: b._id || b.id,
            boxChat: {
              boxChatId: b._id || b.id,
              nameBox: b.name_box || b.name || "",
              // server may use `ava_box` snake_case
              avaBox: b.ava_box || b.avaBox || avatar,
            },
            members,
            memberObjects,
            messages: b.messages || [],
            updatedAt: b.updated_at || b.updatedAt || b.created_at || b.createdAt,
            boxType: b.boxType || b.box_type,
          };
        });
        if (mounted) setGroupChatDetails(mapped);
      } catch (err) {
        console.error("Fetch boxes failed", err);
      }
    };

    fetchGroups();

    return () => {
      mounted = false;
    };
  }, [user?.token, currentUserId]);

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

    // Use REST API createBox to create the chat box on server
    const service = chatApi();
    const payload = {
      name: newGroupName,
      type: defaultBoxType || "PERSONAL",
      memberIds: [currentUserId],
      avatar: avaBoxUrl,
    };

    (async () => {
      try {
        const saved = await service.createBox(user.token, payload);
        setShowAddGroup(false);
        setNewGroupName("");
        setNewGroupAvatar(null);
        setPreviewAvatar(null);

        // Normalize saved box to the same internal shape
        const savedMembers = Array.isArray(saved.memberIds)
          ? saved.memberIds
          : Array.isArray(saved.members)
          ? saved.members.map((m) => m.userId || m.user_id).filter(Boolean)
          : [currentUserId].filter(Boolean);

        const mappedSaved = {
          id: saved._id || saved.id,
          boxChat: {
            boxChatId: saved._id || saved.id,
            nameBox: saved.name_box || saved.name || newGroupName,
            avaBox: saved.ava_box || saved.avaBox || saved.avatar || payload.avatar || avatar,
          },
          members: savedMembers,
          messages: saved.messages || [],
          updatedAt: saved.updated_at || saved.updatedAt || saved.created_at,
          boxType: saved.boxType || saved.box_type || saved.type || payload.type,
        };

        // Insert created box into list and select it
        setGroupChatDetails((prev) => (mappedSaved ? [mappedSaved, ...prev] : prev));
        setSelectedBox(mappedSaved);
      } catch (err) {
        console.error("Create box failed", err);
        // show simple error to user
        alert(
          "Tạo nhóm thất bại: " + (err?.response?.data?.message || err.message)
        );
      }
    })();
  };

  const handleSelectGroup = (group) => {
    setSelectedBox(group);
  };

  return (
    <div className="group__chat__container">
      <div className="group__chat__header">
        {/* Header now mainly reserved for the list - Add Group button is rendered by parent `GroupComponent` */}
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
