import { useContext, useState, useEffect, useRef } from "react";
import "./FeatureChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import userApi from "../../../service/UserService";
import defaulfAvatar from "../../../assets/logo-login.png";
import chatApi from "../../../service/ChatService";
import { jwtDecode } from "jwt-decode";

const FeatureChat = () => {
  const { selectedBox, setSelectedBox, isFeatureChatOpen, setBoxesVersion } =
    useContext(ChatContext);
  const { user } = useAuth();
  const { getUserById, getUserByEmail, getAllUsers } = userApi();
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]); // array of user objects to add in batch

  // no local socket needed here — use REST for updates

  // Lấy danh sách thành viên hiện tại (userList)
  useEffect(() => {
    // memberRefs can be either an array of ids (strings) or an array of memberObjects whose userId
    // may be a string or an object. Normalize and only fetch missing users.
    const memberRefs =
      (Array.isArray(selectedBox?.memberObjects) &&
        selectedBox.memberObjects.map((m) => m.userId).filter(Boolean)) ||
      (Array.isArray(selectedBox?.members) && selectedBox.members) ||
      [];
    if (!memberRefs || memberRefs.length === 0) return setUserList([]);

    const fetchUsers = async () => {
      // preloaded map for entries where user object is already embedded
      const preloaded = {};
      const idsToFetch = [];

      memberRefs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "string") {
          idsToFetch.push(ref);
        } else if (typeof ref === "object") {
          // ref could be the user object itself or an object with _id
          const id =
            ref._id ||
            ref.id ||
            (ref.user && (ref.user._id || ref.user.id)) ||
            null;
          if (id) {
            // if ref already contains full profile fields, store it
            const maybeUser =
              ref.full_name || ref.email || (ref.user && ref.user.full_name)
                ? ref.user || ref
                : null;
            if (maybeUser) preloaded[id] = maybeUser;
            idsToFetch.push(id);
          }
        }
      });

      // dedupe ids
      const uniqueIds = Array.from(new Set(idsToFetch));

      // fetch missing users (but reuse preloaded ones)
      const fetchPromises = uniqueIds.map(async (id) => {
        if (preloaded[id]) return preloaded[id];
        try {
          const res = await getUserById(user.token, id);
          return res;
        } catch (e) {
          return {
            _id: id,
            full_name: id,
            avatar_link: "",
            email: "",
          };
        }
      });

      const fetched = await Promise.all(fetchPromises);
      // maintain original order of memberRefs by mapping back
      const byId = {};
      fetched.forEach((u) => {
        if (u && (u._id || u.id)) byId[u._id || u.id] = u;
      });

      const ordered = [];
      memberRefs.forEach((ref) => {
        const id =
          typeof ref === "string"
            ? ref
            : ref._id || ref.id || (ref.user && (ref.user._id || ref.user.id));
        if (!id) return;
        const userObj =
          byId[id] ||
          preloaded[id] ||
          (typeof ref === "object" && (ref.user || ref.full_name)
            ? ref.user || ref
            : null);
        if (userObj) ordered.push(userObj);
      });

      setUserList(ordered);
    };

    fetchUsers();
    // eslint-disable-next-line
  }, [selectedBox]);

  // no longer fetch a static list of users to add; adding is done by email lookup

  // Thêm thành viên qua socket
  const handleAddMember = async (userId) => {
    if (!userId || !selectedBox) return;
    if (
      Array.isArray(selectedBox.members) &&
      selectedBox.members.includes(userId)
    )
      return;
    if (isAdding) return;
    setIsAdding(true);
    try {
      const service = chatApi();
      // server supports receiving only the new ids; send single id to append
      const res = await service.updateBoxMembers(user.token, selectedBox.id, {
        memberIds: [userId],
      });
      // update local selectedBox with server response if available
      if (res) setSelectedBox(res);
      else {
        // if server didn't return full box, optimistically append
        setSelectedBox((prev) => ({
          ...prev,
          members: Array.from(new Set([...(prev?.members || []), userId])),
        }));
      }
    } catch (err) {
      console.error("Update box members failed", err);
      // fallback: optimistically update UI
      setSelectedBox((prev) => ({
        ...prev,
        members: Array.from(new Set([...(prev?.members || []), userId])),
      }));
    } finally {
      setIsAdding(false);
    }
  };

  // Start or open a personal chat with a user (create box with empty name and type PERSONAL)
  const startPersonalChat = async (memberId) => {
    if (!memberId || !user) return;
    // determine current user id and prevent creating a personal chat with yourself
    let currentUserId = null;
    try {
      const decoded = jwtDecode(user.token);
      currentUserId =
        decoded.id || decoded._id || decoded.userId || decoded.sub || null;
      if (currentUserId && currentUserId === memberId) {
        // clicking yourself: do nothing
        return;
      }
    } catch (e) {
      // ignore decoding errors and proceed (currentUserId may remain null)
    }
    if (isAdding) return;
    setIsAdding(true);
    try {
      const service = chatApi();
      // include both participants' ids in the create payload; dedupe and filter falsy
      const memberIds = Array.from(
        new Set(
          [...(currentUserId ? [currentUserId] : []), memberId].filter(Boolean)
        )
      );
      const payload = {
        name: "",
        type: "PERSONAL",
        memberIds,
      };
      const res = await service.createBox(user.token, payload);
      if (res) {
        // server returns created/selected box
        setSelectedBox(res);
        try {
          setBoxesVersion((v) => (v || 0) + 1);
        } catch (e) {
          /* ignore if not provided */
        }
        setShowAddPopup(false);
      }
    } catch (err) {
      console.error("Failed to create personal box", err);
      alert("Unable to start personal chat.");
    } finally {
      setIsAdding(false);
    }
  };

  // Add member by email: resolve via getUserByEmail then call updateBoxMembers
  const addMemberByEmail = async () => {
    const email = (emailToAdd || "").trim();
    if (!email) return alert("Please enter an email address.");
    if (isAdding) return;
    setIsAdding(true);
    try {
      const resp = await getUserByEmail(user.token, email);
      const foundId = resp?.user?._id;
      if (!foundId) {
        setIsAdding(false);
        return alert(`No user found for ${email}`);
      }
      // reuse existing flow
      await handleAddMember(foundId);
      setEmailToAdd("");
      setShowAddPopup(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add user by email.");
    } finally {
      setIsAdding(false);
    }
  };

  // Batch add selected users in selectedToAdd to the box when user clicks Add
  const handleBatchAdd = async () => {
    if (!selectedBox || !selectedToAdd || selectedToAdd.length === 0) return;
    if (isAdding) return;
    setIsAdding(true);
    try {
      const ids = selectedToAdd
        .map((u) => u._id || u.id || u.user_id)
        .filter(Boolean)
        // exclude ones already in the box
        .filter((id) => !isAlreadyMember(id));

      if (ids.length === 0) {
        setIsAdding(false);
        setSelectedToAdd([]);
        setShowAddPopup(false);
        return;
      }
      const service = chatApi();
      const res = await service.updateBoxMembers(user.token, selectedBox.id, {
        memberIds: ids,
      });
      if (res) setSelectedBox(res);
      else
        setSelectedBox((prev) => ({
          ...prev,
          members: Array.from(new Set([...(prev?.members || []), ...ids])),
        }));

      setSelectedToAdd([]);
      setEmailToAdd("");
      setShowAddPopup(false);
    } catch (err) {
      console.error('Batch add failed', err);
      alert('Failed to add users');
    } finally {
      setIsAdding(false);
    }
  };

  // Load all users for suggestions when Add People popup opens
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      if (!showAddPopup || !user?.token) return;
      try {
        const users = await getAllUsers(user.token);
        if (!mounted) return;
        const list = Array.isArray(users) ? users : users?.data || users?.users || [];
        setAllUsers(list || []);
      } catch (e) {
        console.warn('Failed to load all users for suggestions', e);
      }
    };
    loadAll();
    return () => {
      mounted = false;
    };
  }, [showAddPopup, user?.token, getAllUsers]);

  // helper: check whether an id is already a member of selectedBox
  const isAlreadyMember = (id) => {
    if (!id || !selectedBox) return false;
    if (Array.isArray(selectedBox.members) && selectedBox.members.includes(id)) return true;
    if (Array.isArray(selectedBox.memberObjects)) {
      return selectedBox.memberObjects.some((m) => {
        const uid = m.userId || m.user_id || m._id || m.id || (m.user && (m.user._id || m.user.id));
        return uid === id;
      });
    }
    return false;
  };

  // Delete box chat via REST (admins only)
  const handleDeleteChat = async () => {
    if (!selectedBox?.id) return;

    // decode current user id from token
    let currentUserId = null;
    try {
      const decoded = jwtDecode(user.token);
      currentUserId =
        decoded.id || decoded._id || decoded.userId || decoded.sub || null;
    } catch (e) {
      currentUserId = null;
    }

    // determine admin permission from selectedBox.memberObjects (server should provide isAdmin/is_admin)
    const isAdmin = Array.isArray(selectedBox?.memberObjects)
      ? selectedBox.memberObjects.some((m) => {
          const uid = m.userId || m.user_id || m._id || m.id;
          const adminFlag =
            m.isAdmin === true || m.is_admin === true || m.is_admin === "true";
          return uid && uid === currentUserId && adminFlag;
        })
      : false;

    if (!isAdmin) {
      alert("Bạn không có quyền giải tán nhóm");
      return;
    }

    // confirm deletion
    if (!window.confirm("Bạn có chắc chắn muốn giải tán nhóm không?")) return;

    try {
      const service = chatApi();
      await service.deleteBox(user.token, selectedBox.id);
      setSelectedBox(null);
      // bump boxesVersion so sidebar list will refetch
      try {
        setBoxesVersion((v) => (v || 0) + 1);
      } catch (e) {
        /* ignore if not available */
      }
      alert("Nhóm đã được giải tán");
    } catch (err) {
      console.error("Delete box failed", err);
      alert(
        "Xóa nhóm thất bại: " + (err?.response?.data?.message || err.message)
      );
    }
  };

  const handleFeatureClick = (featureName) => {
    console.log(`${featureName} clicked`);
  };

  if (!isFeatureChatOpen) return null;
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
            <div className="feature__menu__item" onClick={handleDeleteChat}>
              <i className="fa-solid fa-trash"></i>
              <span>Delete chat</span>
            </div>
          </div>
        )}
      </div>

      <div className="feature__chat__user">
        <img
          src={selectedBox?.boxChat?.avaBox || defaulfAvatar}
          alt="User Avatar"
        />
        <h2>{selectedBox?.boxChat?.nameBox || "No Chat Selected"}</h2>
        <div className="feature__detail__class">
          <div className="team-selection">
            <p>Common Team</p>
            <button
              className="add-people-btn"
              onClick={() => setShowAddPopup(true)}
            >
              <i
                className="fa-solid fa-user-plus"
                style={{ marginRight: 6 }}
              ></i>
              Add People
            </button>
            {/* Danh sách thành viên hiện tại */}
            <div className="team-members">
              {userList.length > 0 ? (
                userList.map((user) => (
                  <div
                    key={user._id}
                    className="team-member"
                    role="button"
                    tabIndex={0}
                    onClick={() => startPersonalChat(user._id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        startPersonalChat(user._id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="team-member-avatar">
                      <img
                        src={
                          user.avatar_link
                            ? `https://stacklog.id.vn/${user.avatar_link}`
                            : defaulfAvatar
                        }
                        alt={user.full_name}
                        onError={(e) =>
                          (e.target.src =
                            "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")
                        }
                      />
                      <div className="status-indicator"></div>
                    </div>
                    <div className="team-member-info">
                      <div className="team-member-name">{user.full_name}</div>
                      <div className="team-member-email">{user.email}</div>
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

      {/* Popup Add People */}
      {showAddPopup && (
        <div className="add-people-modal">
          <div className="add-people-modal-content">
            <div className="add-people-modal-header">
              <span>Add members to group</span>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddPopup(false)}
              >
                &times;
              </button>
            </div>
            <div className="add-people-list">
              <div className="add-people-controls">
                <label className="sr-only">User email</label>
                <div className="input-wrap">
                  <i className="fa-solid fa-envelope input-icon"></i>
                  <input
                    type="text"
                    placeholder="user@example.com"
                    value={emailToAdd}
                    onChange={(e) => setEmailToAdd(e.target.value)}
                    className="email-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addMemberByEmail();
                      }
                    }}
                  />
                </div>
                {/* suggestion list (client-side filter from getAllUsers) */}
                {showAddPopup && emailToAdd && allUsers && allUsers.length > 0 && (
                  <div className="add-user-suggestions">
                    {allUsers
                      .filter((u) => {
                        const q = emailToAdd.toLowerCase();
                        // skip users already in the box
                        const uid = u._id || u.id || u.user_id || null;
                        if (isAlreadyMember(uid)) return false;
                        return (
                          (u.email && u.email.toLowerCase().includes(q)) ||
                          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
                          (String(u.work_id || '').toLowerCase().includes(q))
                        );
                      })
                      .slice(0, 8)
                      .map((u) => (
                        <div
                          key={u._id || u.user_id || u.email}
                          className="add-user-suggestion-item"
                          onClick={() => {
                            // add to local selected list instead of immediate server add
                            const id = u._id || u.id || u.user_id;
                            if (!id) return;
                            // avoid duplicates
                            if (selectedToAdd.find((s) => (s._id || s.id) === id)) return;
                            setSelectedToAdd((prev) => [...prev, u]);
                            setEmailToAdd("");
                          }}
                        >
                          <img src={u.avatar_link ? `https://stacklog.id.vn/${u.avatar_link}` : defaulfAvatar} alt={u.full_name || u.email} />
                          <div className="add-user-suggestion-info">
                            <div className="name">{u.full_name || u.email}</div>
                            <div className="email">{u.email}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
                {/* selected list preview */}
                {selectedToAdd && selectedToAdd.length > 0 && (
                  <div className="selected-add-list">
                    {selectedToAdd.map((u) => (
                      <div key={u._id || u.email} className="selected-add-chip">
                        <img src={u.avatar_link ? `https://stacklog.id.vn/${u.avatar_link}` : defaulfAvatar} alt={u.full_name || u.email} />
                        <div className="selected-add-info">
                          <div className="name">{u.full_name || u.email}</div>
                          <div className="email">{u.email}</div>
                        </div>
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() => setSelectedToAdd((prev) => prev.filter((x) => (x._id || x.email) !== (u._id || u.email)))}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleBatchAdd}
                  className="add-member-btn btn-create-add"
                  disabled={isAdding || (selectedToAdd.length === 0 && !emailToAdd.trim())}
                >
                  {isAdding ? (
                    <span className="btn-content">
                      <span className="spinner" /> Adding...
                    </span>
                  ) : (
                    <span className="btn-content">
                      <i
                        className="fa-solid fa-user-plus"
                        style={{ marginRight: 8 }}
                      />
                      Add
                    </span>
                  )}
                </button>
              </div>
              <div className="helper-text">
              </div>
            </div>
          </div>
          <div
            className="add-people-modal-backdrop"
            onClick={() => setShowAddPopup(false)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default FeatureChat;
