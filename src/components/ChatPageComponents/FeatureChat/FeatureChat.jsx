import { useContext, useState, useEffect, useRef } from "react";
import "./FeatureChat.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import userApi from "../../../service/UserService";
import defaulfAvatar from "../../../assets/logo-login.png";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3002";

const USER_IDS = [
  "688e1182e4acb643f2bbc47e",
  "688e11b2e4acb643f2bbc482",
  "688e110fe4acb643f2bbc47b",
  "688e119fe4acb643f2bbc480",
  "688e11c4e4acb643f2bbc484",
  "688e1238e4acb643f2bbc486",
];

const FeatureChat = () => {
  const { selectedBox, setSelectedBox, isFeatureChatOpen } =
    useContext(ChatContext);
  const { user } = useAuth();
  const { getUserById } = userApi();
  const [isFeatureOpen, setIsFeatureOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [usersToAdd, setUsersToAdd] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const socketRef = useRef(null);

  // Kết nối socket
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    // Lắng nghe cập nhật group realtime
    const handleGroupsUpdated = () => {
      if (selectedBox?.id) {
        socketRef.current.emit("getGroups", user?._id || user?.id, (groups) => {
          const found = groups.find((g) => g.id === selectedBox.id);
          if (found) setSelectedBox(found);
        });
      }
    };
    socketRef.current.on("groupsUpdated", handleGroupsUpdated);

    return () => {
      socketRef.current.off("groupsUpdated", handleGroupsUpdated);
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [selectedBox?.id, user]);

  // Lấy danh sách thành viên hiện tại (userList)
  useEffect(() => {
    if (!selectedBox?.members) return setUserList([]);
    const fetchUsers = async () => {
      const promises = selectedBox.members.map(async (id) => {
        try {
          const res = await getUserById(user.token, id);
          return res;
        } catch {
          return {
            _id: id,
            full_name: id,
            avatar_link: "",
            email: "",
          };
        }
      });
      const users = await Promise.all(promises);
      setUserList(users);
    };
    fetchUsers();
    // eslint-disable-next-line
  }, [selectedBox]);

  // Lấy danh sách user có thể add (usersToAdd)
  useEffect(() => {
    if (!selectedBox?.members) return setUsersToAdd([]);
    const idsToAdd = USER_IDS.filter((id) => !selectedBox.members.includes(id));
    const fetchUsers = async () => {
      const promises = idsToAdd.map(async (id) => {
        try {
          const res = await getUserById(user.token, id);
          return res;
        } catch {
          return {
            _id: id,
            full_name: id,
            avatar_link: "",
            email: "",
          };
        }
      });
      const users = await Promise.all(promises);
      setUsersToAdd(users);
    };
    fetchUsers();
    // eslint-disable-next-line
  }, [selectedBox]);

  // Thêm thành viên qua socket
  const handleAddMember = (userId) => {
    if (!userId || !selectedBox) return;
    if (selectedBox.members.includes(userId)) return;
    const updatedGroup = {
      ...selectedBox,
      members: [...selectedBox.members, userId],
    };
    socketRef.current.emit("updateGroup", updatedGroup, (group) => {
      setSelectedBox(group);
    });
  };

  // Xóa group qua socket
  const handleDeleteChat = () => {
    if (!selectedBox?.id) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa group này?")) return;
    socketRef.current.emit("deleteGroup", selectedBox.id, () => {
      setSelectedBox(null);
    });
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
                  <div key={user._id} className="team-member">
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
              <span>Thêm thành viên vào nhóm</span>
              <button
                className="close-modal-btn"
                onClick={() => setShowAddPopup(false)}
              >
                &times;
              </button>
            </div>
            <div className="add-people-list">
              {usersToAdd.length > 0 ? (
                usersToAdd.map((u) => (
                  <div key={u._id} className="add-people-row">
                    <img
                      src={
                        u.avatar_link
                          ? `http://103.166.183.142:8080/${u.avatar_link}`
                          : defaulfAvatar
                      }
                      alt={u.full_name}
                      className="add-people-avatar"
                    />
                    <span className="add-people-name">{u.full_name}</span>
                    <button
                      onClick={() => handleAddMember(u._id)}
                      className="add-member-btn  btn-create-add"
                    >
                      <i
                        className="fa-solid fa-user-plus"
                        style={{ marginRight: 6 }}
                      ></i>
                    </button>
                  </div>
                ))
              ) : (
                <span style={{ color: "#888" }}>
                  Không còn user nào để thêm
                </span>
              )}
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
