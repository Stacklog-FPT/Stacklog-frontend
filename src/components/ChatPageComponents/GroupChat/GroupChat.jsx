import React, { useContext, useEffect, useState } from "react";
import avatar from "../../../assets/logo-login.png";
import "./GroupChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
import chatApi from "../../../service/ChatService";
import userApi from "../../../service/UserService";

const GroupChat = ({
  showAddGroup: externalShowAddGroup,
  setShowAddGroup: externalSetShowAddGroup,
  defaultBoxType,
}) => {
  const { setSelectedBox } = useContext(ChatContext);
  const [groupChatDetails, setGroupChatDetails] = useState([]);
  const [localShowAddGroup, setLocalShowAddGroup] = useState(false);
  const showAddGroup =
    externalShowAddGroup !== undefined
      ? externalShowAddGroup
      : localShowAddGroup;
  const setShowAddGroup =
    externalSetShowAddGroup !== undefined
      ? externalSetShowAddGroup
      : setLocalShowAddGroup;
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupAvatar, setNewGroupAvatar] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const { getUserByEmail, getUserById } = userApi();
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [membersEmails, setMembersEmails] = useState([]);

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
            members = b.members
              .map((m) => m.userId || m.user_id)
              .filter(Boolean);
          } else {
            members = [currentUserId].filter(Boolean);
          }

          // keep original member objects when server provides them
          const memberObjects =
            Array.isArray(b.members) && b.members.length
              ? b.members
              : undefined;

          // determine display name: for PERSONAL boxes without name, use the other member's id
          let nameBox = b.name_box || b.name || "";
          const boxType = b.boxType || b.box_type || "";
          if (!nameBox && String(boxType).toUpperCase() === "PERSONAL") {
            // try to pick the other member id
            const other =
              (Array.isArray(members) &&
                members.find((m) => m !== currentUserId)) ||
              null;
            nameBox = other || "";
          }

          return {
            id: b._id || b.id,
            boxChat: {
              boxChatId: b._id || b.id,
              nameBox,
              // server may use `ava_box` snake_case
              avaBox: b.ava_box || b.avaBox || avatar,
            },
            members,
            memberObjects,
            messages: b.messages || [],
            updatedAt:
              b.updated_at || b.updatedAt || b.created_at || b.createdAt,
            boxType,
          };
        });
        // For PERSONAL boxes where server didn't return a human name, we used the other member's id as
        // a temporary name. Try to fetch those users' profiles so we can display a nicer name and avatar.
        const personalOtherIds = new Set();
        mapped.forEach((m) => {
          try {
            if (String(m.boxType).toUpperCase() === "PERSONAL") {
              const other =
                (Array.isArray(m.members) &&
                  m.members.find((x) => x !== currentUserId)) ||
                null;
              if (other) personalOtherIds.add(other);
            }
          } catch (e) {}
        });

        if (personalOtherIds.size > 0) {
          const idsToFetch = Array.from(personalOtherIds);
          try {
            const respPromises = idsToFetch.map((id) =>
              getUserById(user.token, id)
                .then((r) => r)
                .catch(() => null)
            );
            const profiles = await Promise.all(respPromises);
            const profileMap = {};
            profiles.forEach((p) => {
              if (p && (p._id || p.id)) profileMap[p._id || p.id] = p;
            });

            // apply profile data to mapped boxes
            mapped.forEach((m) => {
              if (String(m.boxType).toUpperCase() === "PERSONAL") {
                const other =
                  (Array.isArray(m.members) &&
                    m.members.find((x) => x !== currentUserId)) ||
                  null;
                if (other && profileMap[other]) {
                  const prof = profileMap[other];
                  m.boxChat.nameBox =
                    prof.full_name ||
                    prof.email ||
                    prof._id ||
                    m.boxChat.nameBox;
                  m.boxChat.avaBox = prof.avatar_link
                    ? `https://stacklog.id.vn/${prof.avatar_link}`
                    : m.boxChat.avaBox;
                }
              }
            });
          } catch (e) {
            // ignore profile fetch failures and keep previous mapped values
            console.warn(
              "Failed to fetch one or more profiles for PERSONAL boxes",
              e
            );
          }
        }

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

  // Tạo group mới
  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const service = chatApi();
    let avaBoxUrl = avatar;
    if (previewAvatar) avaBoxUrl = previewAvatar;

    const payload = {
      name: newGroupName,
      type: defaultBoxType || "PERSONAL",
      memberIds: [currentUserId],
      avatar: avaBoxUrl,
    };

    try {
      // Resolve provided member emails to user IDs
      const emails = (membersEmails || [])
        .map((s) => String(s).trim())
        .filter(Boolean);
      const resolvedIds = [];
      const failed = [];
      if (emails.length) {
        const promises = emails.map((email) =>
          getUserByEmail(user.token, email)
            .then((res) => ({ ok: true, email, id: res?.user?._id }))
            .catch(() => ({ ok: false, email }))
        );
        const results = await Promise.all(promises);
        results.forEach((r) => {
          if (r.ok && r.id) resolvedIds.push(r.id);
          else failed.push(r.email);
        });
      }

      payload.memberIds = Array.from(
        new Set([...(payload.memberIds || []), ...resolvedIds])
      );

      const saved = await service.createBox(user.token, payload);

      setShowAddGroup(false);
      setNewGroupName("");
      setNewGroupAvatar(null);
      setPreviewAvatar(null);
      setNewMemberEmail("");
      setMembersEmails([]);

      // Normalize saved box to the same internal shape
      const savedMembers = Array.isArray(saved.memberIds)
        ? saved.memberIds
        : Array.isArray(saved.members)
        ? saved.members.map((m) => m.userId || m.user_id).filter(Boolean)
        : [currentUserId].filter(Boolean);

      // determine nameBox: prefer server value, fallback to newGroupName, and for PERSONAL use other member id
      let savedName = saved.name_box || saved.name || newGroupName || "";
      const savedBoxType =
        saved.boxType || saved.box_type || saved.type || payload.type || "";
      if (!savedName && String(savedBoxType).toUpperCase() === "PERSONAL") {
        const other =
          (Array.isArray(savedMembers) &&
            savedMembers.find((m) => m !== currentUserId)) ||
          null;
        savedName = other || "";
      }

      const mappedSaved = {
        id: saved._id || saved.id,
        boxChat: {
          boxChatId: saved._id || saved.id,
          nameBox: savedName,
          avaBox:
            saved.ava_box ||
            saved.avaBox ||
            saved.avatar ||
            payload.avatar ||
            avatar,
        },
        members: savedMembers,
        messages: saved.messages || [],
        updatedAt: saved.updated_at || saved.updatedAt || saved.created_at,
        boxType: savedBoxType,
      };

      // Insert created box into list and select it
      setGroupChatDetails((prev) =>
        mappedSaved ? [mappedSaved, ...prev] : prev
      );
      setSelectedBox(mappedSaved);

      if (failed.length) {
        alert(
          "Could not find users for emails: " +
            failed.join(", ") +
            ". The group was created with the valid members."
        );
      }
    } catch (err) {
      console.error("Create box failed", err);
      alert(
        "Create group failed: " + (err?.response?.data?.message || err.message)
      );
    }
  };

  const handleSelectGroup = (group) => {
    setSelectedBox(group);
  };

  // helper: robustly check whether a members array contains a given user id
  const membersInclude = (members, id) => {
    if (!members || !id) return false;
    return members.some((m) => {
      if (!m) return false;
      if (typeof m === "string") return m === id;
      // object shapes: { userId } or { user: { _id } } or id fields
      const uid =
        m.userId ||
        m.user_id ||
        m._id ||
        m.id ||
        (m.user && (m.user._id || m.user.id));
      return uid === id;
    });
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
              <span>Create new group</span>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddGroup(false)}
              >
                &times;
              </button>
            </div>
            <form className="add-group-form" onSubmit={handleAddGroup}>
              <div className="form-grid">
                <div className="left">
                  <div className="add-group-avatar-upload">
                    <label
                      htmlFor="group-avatar-input"
                      className="avatar-label"
                    >
                      <img
                        src={previewAvatar || avatar}
                        alt="avatar"
                        className="add-group-avatar-preview"
                      />
                      <span className="avatar-upload-text">Change avatar</span>
                    </label>
                    <input
                      id="group-avatar-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                    />
                    <p className="hint">Group avatar (optional)</p>
                  </div>
                </div>

                <div className="right">
                  <label className="label">Group name</label>
                  <input
                    type="text"
                    placeholder="e.g. Class 12A1"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    required
                    className="add-group-input"
                  />

                  <label className="label">Add members by email</label>
                  <div className="add-members-row">
                    <input
                      type="email"
                      placeholder="e.g. user@example.com"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="add-member-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newMemberEmail) {
                          setMembersEmails((prev) => [
                            ...prev,
                            newMemberEmail.trim(),
                          ]);
                          setNewMemberEmail("");
                        }
                      }}
                      className="btn-add-member"
                    >
                      Add
                    </button>
                  </div>

                  {membersEmails.length > 0 && (
                    <div className="members-list">
                      {membersEmails.map((email, index) => (
                        <div key={`${email}-${index}`} className="member-chip">
                          <span className="chip-text">{email}</span>
                          <button
                            type="button"
                            className="chip-remove"
                            onClick={() =>
                              setMembersEmails((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="add-group-btns">
                    <button type="submit" className="btn-create-group">
                      Create group
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddGroup(false)}
                      className="btn-cancel-group"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
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
            .filter((boxDetail) =>
              membersInclude(boxDetail.members, currentUserId)
            )
            .map((boxDetail, idx) => (
              <div
                key={
                  boxDetail.id || boxDetail.boxChat?.boxChatId || `box-${idx}`
                }
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
