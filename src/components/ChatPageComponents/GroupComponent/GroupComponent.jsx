import React, { useContext, useState, useEffect, useRef } from "react";
import "./GroupComponent.scss";
import { ColorModeContext } from "../../../context/ColorModeContext";
import GroupChat from "../GroupChat/GroupChat";
import RecentChat from "../RecentChatComponent/RecentChat";
import userApi from "../../../service/UserService";
import chatApi from "../../../service/ChatService";
import { useAuth } from "../../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { ChatContext } from "../../../context/ChatContext";
import { jwtDecode } from "jwt-decode";
import avatar from "../../../assets/logo-login.png";

const GroupComponent = () => {
  const { mode } = useContext(ColorModeContext);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const { getUserByEmail, getAllUsers } = userApi();
  const chatService = chatApi();
  const { user: authUser } = useAuth();
  const { setSelectedBox, setBoxesVersion } = useContext(ChatContext);
  const navigate = useNavigate();

  // State cho search user
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allUsers, setAllUsers] = useState([]);

  const searchRef = useRef(null);

  // Fetch tất cả users khi component mount
  useEffect(() => {
    let mounted = true;
    
    const loadAllUsers = async () => {
      if (!authUser?.token) return;
      setLoading(true);
      try {
        const response = await getAllUsers(authUser.token);
        if (mounted) {
          setAllUsers(response || []);
        }
      } catch (err) {
        console.error("Error loading users:", err);
        if (mounted) {
          setAllUsers([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAllUsers();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.token]);

  // Filter users realtime khi typing
  useEffect(() => {
    if (!searchEmail.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    const query = searchEmail.toLowerCase().trim();
    const filtered = allUsers.filter((user) => {
      const email = (user.email || "").toLowerCase();
      const fullName = (user.full_name || "").toLowerCase();
      return email.includes(query) || fullName.includes(query);
    });

    setSearchResults(filtered.slice(0, 10)); // Giới hạn 10 kết quả
    setError(filtered.length === 0 ? "No users found" : null);
  }, [searchEmail, allUsers]);

  const handleSelectUser = async (targetUser) => {
    if (!targetUser || !targetUser._id || !authUser) return;

    // Xác định currentUserId và ngăn tạo chat với chính mình
    let currentUserId = null;
    try {
      const decoded = jwtDecode(authUser.token);
      currentUserId =
        decoded.id || decoded._id || decoded.userId || decoded.sub || null;
      if (currentUserId && currentUserId === targetUser._id) {
        alert("Bạn không thể chat với chính mình!");
        return;
      }
    } catch (e) {
      console.error("Lỗi decode token:", e);
      alert("Không thể xác định thông tin người dùng.");
      return;
    }

    if (!currentUserId) {
      alert("Không thể xác thực người dùng.");
      return;
    }

    setLoading(true);
    try {
      // Tạo memberIds giống FeatureChat: dedupe và filter falsy
      const memberIds = Array.from(
        new Set([currentUserId, targetUser._id].filter(Boolean))
      );

      const payload = {
        name: "",
        type: "PERSONAL",
        memberIds,
      };

      const createdBox = await chatService.createBox(authUser.token, payload);

      if (createdBox) {
        // Server trả về box đã tạo/đã có, set trực tiếp
        setSelectedBox(createdBox);
        
        // Trigger refresh danh sách boxes
        try {
          setBoxesVersion((v) => (v || 0) + 1);
        } catch (e) {
          // ignore nếu không có setBoxesVersion
        }

        // Navigate đến box chat
        const boxId = createdBox._id || createdBox.id;
        if (boxId) {
          navigate(`/chatbox/${boxId}`);
        }

        // Reset search
        setSearchResults([]);
        setSearchEmail("");
        setError(null);
      }
    } catch (err) {
      console.error("Tạo chat cá nhân thất bại:", err);
      alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group__container">
      <div className="group__heading">
        <div
          className={`group__input ${
            searchResults.length > 0 || loading ? "active" : ""
          }`}
          ref={searchRef}
        >
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search user to chat..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />

          {/* Dropdown suggestions */}
          {searchEmail.trim() && (
            <div className="member-suggestions">
              {loading && allUsers.length === 0 && (
                <div className="member-suggestion-item">Loading users...</div>
              )}

              {!loading && searchResults.length === 0 && error && (
                <div
                  className="member-suggestion-item"
                  style={{ color: "#ef4444" }}
                >
                  {error}
                </div>
              )}

              {!loading && searchResults.length > 0 &&
                searchResults.map((user) => (
                  <div
                    key={user._id || user.email}
                    className="member-suggestion-item"
                    onClick={() => handleSelectUser(user)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={user.avatar_link || "/default-avatar.png"}
                      alt={user.full_name || user.email}
                    />
                    <div className="member-suggestion-info">
                      <div className="member-name">
                        {user.full_name || user.email}
                      </div>
                      <div className="member-email">{user.email}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <button
          className="btn-add-group"
          onClick={() => setShowAddGroup(true)}
          aria-label="Add Group"
        >
          <i className="fa-solid fa-user-plus"></i>
        </button>
      </div>

      <GroupChat
        showAddGroup={showAddGroup}
        setShowAddGroup={setShowAddGroup}
        defaultBoxType={"GROUP"}
      />
      <RecentChat />
    </div>
  );
};

export default GroupComponent;
