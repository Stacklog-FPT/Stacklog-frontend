import React, { useContext, useState, useEffect, useRef } from "react";
import "./GroupComponent.scss";
import { ColorModeContext } from "../../../context/ColorModeContext";
import GroupChat from "../GroupChat/GroupChat";
import RecentChat from "../RecentChatComponent/RecentChat";
import userApi from "../../../service/UserService";
import chatApi from "../../../service/ChatService"; // <-- THÊM DÒNG NÀY
import { useAuth } from "../../../context/AuthProvider";
import { useNavigate } from "react-router-dom"; // <-- THÊM DÒNG NÀY
import { ChatContext } from "../../../context/ChatContext"; // <-- THÊM DÒNG NÀY

const GroupComponent = () => {
  const { mode } = useContext(ColorModeContext);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const { getUserByEmail } = userApi();
  const chatService = chatApi(); // Khởi tạo service để tạo box
  const { user: authUser } = useAuth();
  const { setSelectedBox } = useContext(ChatContext); // Để chọn box
  const navigate = useNavigate(); // Để điều hướng

  // State cho search user
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const searchRef = useRef(null);

  // Hàm gọi API tìm user
  const fetchUserByEmail = async (email) => {
    if (!email.trim()) {
      setSearchResults([]);
      setError(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getUserByEmail(authUser.token, email.trim());
      // Giả sử response trả về: { user: { _id, email, full_name, avatar_link } }
      const foundUser = response?.user || response;

      if (foundUser && foundUser._id) {
        setSearchResults([foundUser]);
      } else {
        setSearchResults([]);
        setError("No user found with this email");
      }
    } catch (err) {
      console.error(err);
      setError("Error searching user");
      setSearchResults([]);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  // Click outside → gọi API
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        if (searchEmail.trim() && !hasSearched) {
          fetchUserByEmail(searchEmail);
        } else if (!searchEmail.trim()) {
          setSearchResults([]);
          setError(null);
          setHasSearched(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchEmail, hasSearched, authUser.token]);

  const handleSelectUser = async (targetUser) => {
    if (!targetUser || !targetUser._id) return;

    let currentUserId = "";
    if (authUser?.token) {
      try {
        const decoded = jwtDecode(authUser.token);
        currentUserId = decoded.id || decoded.email || decoded.username || "";
      } catch (e) {
        alert("Không thể xác định thông tin người dùng.");
        return;
      }
    }

    if (!currentUserId) {
      alert("Không thể xác thực người dùng.");
      return;
    }

    if (targetUser._id === currentUserId) {
      alert("Bạn không thể chat với chính mình!");
      return;
    }

    try {
      const payload = {
        type: "PERSONAL",
        memberIds: [currentUserId, targetUser._id],
      };

      const createdBox = await chatService.createBox(authUser.token, payload);

      // Normalize giống hệt GroupChat
      const members = [currentUserId, targetUser._id];

      const normalizedBox = {
        id: createdBox._id || createdBox.id,
        boxChat: {
          boxChatId: createdBox._id || createdBox.id,
          nameBox: targetUser.full_name || targetUser.email || "Chat cá nhân",
          avaBox: targetUser.avatar_link || avatar, // nếu có import avatar
        },
        members,
        messages: createdBox.messages || [],
        boxType: "PERSONAL",
        updatedAt:
          createdBox.updated_at ||
          createdBox.updatedAt ||
          new Date().toISOString(),
        // KHÔNG thêm memberObjects ở đây nữa!
      };

      // Dùng cách refresh danh sách đúng như khi tạo group
      setSelectedBox(normalizedBox);
      navigate(`/chatbox/${normalizedBox.id}`);

      // Reset search
      setSearchResults([]);
      setSearchEmail("");
      setHasSearched(false);
      setError(null);

      // Trigger refresh để danh sách cập nhật (như mình đã hướng dẫn trước)
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error("Tạo chat cá nhân thất bại:", err);
      alert("Không thể bắt đầu cuộc trò chuyện. Vui lòng thử lại.");
    }
  };

  const handleInputFocus = () => {
    setHasSearched(false);
    setSearchResults([]);
    setError(null);
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
            onChange={(e) => {
              setSearchEmail(e.target.value);
              setHasSearched(false);
              setSearchResults([]);
              setError(null);
            }}
            onFocus={handleInputFocus}
          />

          {/* Dropdown suggestions */}
          {searchEmail.trim() && (hasSearched || loading) && (
            <div className="member-suggestions">
              {loading && (
                <div className="member-suggestion-item">Searching...</div>
              )}

              {!loading && searchResults.length === 0 && error && (
                <div
                  className="member-suggestion-item"
                  style={{ color: "#ef4444" }}
                >
                  {error}
                </div>
              )}

              {!loading &&
                searchResults.length === 0 &&
                !error &&
                hasSearched && (
                  <div className="member-suggestion-item">No users found</div>
                )}

              {!loading &&
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
