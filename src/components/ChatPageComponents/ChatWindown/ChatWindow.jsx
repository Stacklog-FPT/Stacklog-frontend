import { useContext, useState, useRef, useEffect } from "react";
import fileIcon from "../../../assets/chatPageIcon/file_open.png";
import attachmentIcon from "../../../assets/chatPageIcon/attachment.png";
import smileIcon from "../../../assets/chatPageIcon/smile.png";
import avatarDefault from "../../../assets/ava-chat.png";
import "./ChatWindow.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
import userApi from "../../../service/UserService";

const API_URL = "http://localhost:3001/groups";

const ChatWindow = () => {
  const { selectedBox, setSelectedBox, toggleFeatureChat } =
    useContext(ChatContext);
  const { user } = useAuth();
  const { getUserById } = userApi();
  const [myMessage, setMyMessage] = useState("");
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});
  const scrollRef = useRef(null);

  // Lấy id user hiện tại từ JWT token
  let currentUserId = "";
  if (user?.token) {
    try {
      const decoded = jwtDecode(user.token);
      currentUserId = decoded.id || decoded.email || decoded.username || "";
    } catch (e) {
      currentUserId = "";
    }
  }

  // Gửi tin nhắn: chỉ lưu id thật vào createdBy
  const onSend = async () => {
    if (
      !myMessage.trim() ||
      !selectedBox?.id ||
      !selectedBox?.members?.includes(currentUserId)
    )
      return;
    const now = new Date().toISOString();
    const myMsg = {
      chatMessageId: Math.random().toString(),
      chatMessageContent: myMessage,
      createdBy: currentUserId || "anonymous",
      createdAt: now,
    };

    try {
      // Lấy group hiện tại từ server
      const response = await fetch(`${API_URL}/${selectedBox.id}`);
      if (!response.ok) throw new Error("Không thể lấy dữ liệu");
      const currentBox = await response.json();

      currentBox.messages.push(myMsg);

      // Lưu lại group mới
      const saveResponse = await fetch(`${API_URL}/${selectedBox.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentBox),
      });

      if (saveResponse.ok) {
        setSelectedBox(currentBox);
        setMyMessage("");
        setError(null);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      } else {
        throw new Error("Không thể lưu tin nhắn");
      }
    } catch (error) {
      setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.");
    }
  };

  // Polling để lấy tin nhắn mới
  useEffect(() => {
    if (!selectedBox?.id) return;
    const interval = setInterval(async () => {
      const res = await fetch(`${API_URL}/${selectedBox.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBox(data);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedBox?.id, setSelectedBox]);

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (selectedBox?.messages && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedBox?.messages]);

  // Lấy thông tin user thật từ API và cache lại
  const fetchUser = async (id) => {
    if (!id || userCache[id]) return;
    try {
      const userInfo = await getUserById(user.token, id);
      setUserCache((prev) => ({ ...prev, [id]: userInfo }));
    } catch (e) {
      setUserCache((prev) => ({
        ...prev,
        [id]: { name: id, avatar: avatarDefault },
      }));
    }
  };

  // Khi có tin nhắn mới, fetch thông tin user nếu chưa có
  useEffect(() => {
    if (!selectedBox?.messages) return;
    const ids = [...new Set(selectedBox.messages.map((msg) => msg.createdBy))];
    ids.forEach((id) => fetchUser(id));
    // eslint-disable-next-line
  }, [selectedBox?.messages]);

  return (
    <div className="chat__window">
      <div className="chat__page__container">
        <div className="chat__heading">
          <div className="chat__heading__left">
            <img src={selectedBox?.boxChat?.avaBox  || "/placeholder.svg"} alt="Group Avatar" />
            <div className="chat__heading__userinfor">
              <h2>{selectedBox?.boxChat?.nameBox || "StackLog"}</h2>
            </div>
          </div>
          <div className="chat__heading__right">
            <i className="fa-solid fa-phone"></i>
            <i className="fa-solid fa-video"></i>
            <i
              className="fa-solid fa-circle-info"
              onClick={toggleFeatureChat}
            ></i>
          </div>
        </div>

        {error && (
          <div style={{ padding: "8px", color: "red", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div className="chat__content--scroll" ref={scrollRef}>
          {selectedBox?.messages && selectedBox.messages.length > 0 ? (
            [...selectedBox.messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg) => {
                const isMe = msg.createdBy === currentUserId;
                const senderInfo = userCache[msg.createdBy];
                const senderName =
                  senderInfo?.full_name ||
                  senderInfo?.work_id ||
                  senderInfo?.email ||
                  msg.createdBy;
                const senderAvatar = senderInfo?.avatar_link
                  ? `https://stacklog.id.vn/${senderInfo.avatar_link}`
                  : avatarDefault;

                return (
                  <div
                    key={msg.chatMessageId}
                    className={`chat__message__row ${
                      isMe
                        ? "chat__message__row--right"
                        : "chat__message__row--left"
                    }`}
                  >
                    {!isMe && (
                      <img
                        className="chat__message__avatar"
                        src={senderAvatar}
                        alt={senderName}
                      />
                    )}
                    <div
                      className={`chat__message ${
                        isMe ? "chat__message--right" : "chat__message--left"
                      }`}
                    >
                      <div className="chat__message__info">
                        <span className="chat__message__name">
                          {senderName}
                        </span>
                        <span className="chat__message__time">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="chat__message__content">
                        {msg.chatMessageContent}
                      </div>
                    </div>
                    {isMe && (
                      <img
                        className="chat__message__avatar"
                        src={senderAvatar}
                        alt={senderName}
                      />
                    )}
                  </div>
                );
              })
          ) : (
            <p style={{ textAlign: "center" }}>Chưa có tin nhắn</p>
          )}
        </div>

        <div className="chat__footer">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={myMessage}
            onChange={(e) => setMyMessage(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && onSend()}
          />
          <div className="chat__footer__feature">
            <div className="wrapper__feature">
              <i className="fas fa-at"></i>
              <img src={fileIcon || "/placeholder.svg"} alt="file" />
              <img
                src={attachmentIcon || "/placeholder.svg"}
                alt="attachment"
              />
              <img src={smileIcon || "/placeholder.svg"} alt="smile" />
            </div>
            <div className="send__message" onClick={onSend}>
              <i className="fa-regular fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
