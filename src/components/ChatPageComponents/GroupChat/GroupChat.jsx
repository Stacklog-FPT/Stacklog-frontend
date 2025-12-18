import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setBoxes } from "../../../redux/slice/chatSlice";
import avatar from "../../../assets/logo-login.png";
import "./GroupChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
import chatApi from "../../../service/ChatService";
import userApi from "../../../service/UserService";
import { fetchUserById } from "../../../service/UserService";
import Swal from "sweetalert2";

const GroupChat = ({
  showAddGroup: externalShowAddGroup,
  setShowAddGroup: externalSetShowAddGroup,
  defaultBoxType,
}) => {
  const { setSelectedBox, boxesVersion } = useContext(ChatContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
  const { getUserByEmail, getAllUsers } = userApi();
  const [membersEmails, setMembersEmails] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [memberQuery, setMemberQuery] = useState("");

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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
              fetchUserById(user.token, id)
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
                  m.boxChat.avaBox = prof.avatar_link;
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

        if (mounted) {
          // Update Redux store with fetched boxes
          dispatch(setBoxes(mapped));

          // For any box that doesn't have normalized messages, fetch its messages
          // and normalize them so the left-hand list can show the last message text.
          const boxesToFetch = mapped.filter(
            (m) =>
              !Array.isArray(m.messages) ||
              m.messages.length === 0 ||
              // also fetch if last message lacks a `chatMessageContent` field
              !(
                m.messages[m.messages.length - 1] &&
                m.messages[m.messages.length - 1].chatMessageContent
              )
          );

          if (boxesToFetch.length > 0) {
            try {
              const fetches = boxesToFetch.map((box) =>
                service
                  .getMessages(user.token, box.id)
                  .then((msgs) => ({ boxId: box.id, msgs }))
                  .catch((err) => ({ boxId: box.id, msgs: null }))
              );

              const results = await Promise.all(fetches);

              // helper to normalize a raw message from server into our UI shape
              const normalizeMsg = (m) => ({
                chatMessageId:
                  m._id ||
                  m.chat_message_id ||
                  m.chatMessageId ||
                  Math.random().toString(),
                chatMessageContent:
                  m.content ||
                  m.chat_message_content ||
                  m.chatMessageContent ||
                  m.message ||
                  m.text ||
                  "",
                createdBy:
                  m.createdBy ||
                  m.created_by ||
                  m.senderId ||
                  m.sender_id ||
                  "",
                createdAt:
                  m.createdAt ||
                  m.created_at ||
                  m.timestamp ||
                  new Date().toISOString(),
                readBy: Array.isArray(m.read_by) ? m.read_by : m.readBy || [],
              });

              results.forEach(({ boxId, msgs }) => {
                if (!msgs || !Array.isArray(msgs) || msgs.length === 0) return;
                const idx = mapped.findIndex((x) => x.id === boxId);
                if (idx === -1) return;
                try {
                  const normalized = msgs.map((mm) => normalizeMsg(mm));
                  mapped[idx].messages = normalized;
                } catch (e) {
                  // leave as-is on error
                }
              });
            } catch (e) {
              // non-fatal
              console.warn("Failed to fetch per-box messages:", e);
            }
          }

          setGroupChatDetails(mapped);
        }
      } catch (err) {
        console.error("Fetch boxes failed", err);
      }
    };

    fetchGroups();

    return () => {
      mounted = false;
    };
  }, [user?.token, currentUserId, refreshTrigger, boxesVersion]); // Thêm boxesVersion để auto refresh

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

  // Fetch user list for member suggestions when modal opens
  useEffect(() => {
    let mounted = true;
    const service = chatApi();
    const loadUsers = async () => {
      if (!showAddGroup || !user?.token) return;
      try {
        // prefer UserService getAllUsers via userApi()
        const users = await getAllUsers(user.token);
        if (!mounted) return;
        // Some getAllUsers endpoints return { data: [...] } or array directly
        const list = Array.isArray(users)
          ? users
          : users?.data || users?.users || [];
        setAllUsers(list);
      } catch (e) {
        console.warn("Failed to load users for suggestions", e);
      }
    };
    loadUsers();
    return () => {
      mounted = false;
    };
  }, [showAddGroup, user?.token]);

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
      setMembersEmails([]);

      // Trigger refresh to reload boxes from server
      setRefreshTrigger((prev) => prev + 1);

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
        Swal.fire({
          icon: "warning",
          title: "Partial Success",
          text:
            "Could not find users for emails: " +
            failed.join(", ") +
            ". The group was created with the valid members.",
        });
      }
    } catch (err) {
      console.error("Create box failed", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Create group failed: " +
          (err?.response?.data?.message || err.message),
      });
    }
  };

  const handleSelectGroup = (group) => {
    try {
      const id =
        group.id || group.boxChat?.boxChatId || group._id || group.boxChat?.id;
      if (id) {
        // navigate to parameterized chat path so URL reflects selected box
        navigate(`/chatbox/${id}`);
      }
    } catch (e) {
      // ignore navigation errors
    }
    // set local selected box after navigation so ChatPage's URL-driven effect
    // can canonicalize the selected box from the route param if needed.
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

  function truncateName(name, maxChars = 3) {
    if (!name) return "";
    // Loại bỏ khoảng trắng thừa và lấy phần tên
    const trimmedName = name.trim();

    if (trimmedName.length <= maxChars) {
      return trimmedName; // Nếu ngắn hơn hoặc bằng thì giữ nguyên
    }

    // Lấy maxChars ký tự đầu tiên (theo Unicode, an toàn với tiếng Việt)
    return trimmedName.slice(0, maxChars) + ".....";
  }
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

                  <label className="label">Add members</label>
                  <div className="add-members-row">
                    <input
                      type="text"
                      placeholder="Search users"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const q = memberQuery.trim();
                          if (!q) return;

                          // Prefer selecting a matching user from suggestions
                          const match = (allUsers || []).find(
                            (u) =>
                              (u.email || "").toLowerCase() === q.toLowerCase()
                          );
                          if (match && match.email) {
                            const email = match.email;
                            if (!membersEmails.includes(email)) {
                              setMembersEmails((prev) => [...prev, email]);
                            }
                            setMemberQuery("");
                            return;
                          }

                          // If typed looks like an email, add as fallback
                          if (q.includes("@") && q.includes(".")) {
                            if (!membersEmails.includes(q)) {
                              setMembersEmails((prev) => [...prev, q]);
                            }
                            setMemberQuery("");
                            return;
                          }
                        }
                      }}
                      className="add-member-input"
                    />
                    {/* removed Add button: selection / Enter key will add items */}
                  </div>

                  {/* Suggestion list from server users */}
                  {memberQuery && allUsers && allUsers.length > 0 && (
                    <div className="member-suggestions">
                      {allUsers
                        .filter((u) => {
                          const q = memberQuery.toLowerCase();
                          return (
                            (u.email && u.email.toLowerCase().includes(q)) ||
                            (u.full_name &&
                              u.full_name.toLowerCase().includes(q)) ||
                            (u.work_id &&
                              String(u.work_id).toLowerCase().includes(q))
                          );
                        })
                        .slice(0, 8)
                        .map((u) => (
                          <div
                            key={u._id || u.user_id || u.email}
                            className="member-suggestion-item"
                            onClick={() => {
                              const email = u.email;
                              if (email && !membersEmails.includes(email)) {
                                setMembersEmails((prev) => [...prev, email]);
                              }
                              setMemberQuery("");
                            }}
                          >
                            <img
                              src={u.avatar_link}
                              alt={u.full_name || u.email}
                            />
                            <div className="member-suggestion-info">
                              <div className="member-name">
                                {u.full_name || u.email}
                              </div>
                              <div className="member-email">{u.email}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {membersEmails.length > 0 && (
                    <div className="members-list">
                      {membersEmails.map((email, index) => {
                        const userObj = (allUsers || []).find(
                          (u) =>
                            (u.email || "").toLowerCase() ===
                            (email || "").toLowerCase()
                        );
                        const ava = userObj
                          ? userObj.avatar_link
                            ? userObj.avatar_link
                            : null
                          : null;
                        const displayName = userObj
                          ? userObj.full_name || userObj.email
                          : email;

                        return (
                          <div
                            key={`${email}-${index}`}
                            className="member-chip"
                          >
                            {ava ? (
                              <img
                                src={ava}
                                alt={displayName}
                                className="chip-avatar"
                              />
                            ) : (
                              <div className="chip-avatar chip-avatar--placeholder" />
                            )}
                            <div className="member-chip-info">
                              <div className="member-name">{displayName}</div>
                              <div className="member-email">{email}</div>
                            </div>
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
                        );
                      })}
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
                      ? truncateName(
                          boxDetail.messages[boxDetail.messages.length - 1]
                            .chatMessageContent,
                          5
                        )
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
