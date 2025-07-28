import React, { useContext, useState, useEffect, useRef } from "react";
import errorIcon from "../../../assets/chatPageIcon/error.png";
import fileIcon from "../../../assets/chatPageIcon/file_open.png";
import attachmentIcon from "../../../assets/chatPageIcon/attachment.png";
import smileIcon from "../../../assets/chatPageIcon/smile.png";
import avatarDefault from "../../../assets/ava-chat.png";
import "./ChatWindow.scss";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";

const ChatWindow = () => {
  const { selectedUser, selectedBox } = useContext(ChatContext);
  const { user } = useAuth();
  const [myMessage, setMyMessage] = useState("");
  const [boxData, setBoxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // Lấy id/email user hiện tại từ JWT token
  let currentUserId = "";
  if (user?.token) {
    try {
      const decoded = jwtDecode(user.token);
      currentUserId = decoded.email || decoded.username || decoded.id || "";
    } catch (e) {
      console.error("Lỗi decode JWT:", e);
    }
  }

  // Format tên thân thiện
  const formatName = (id) => {
    if (!id) return "Anonymous";
    const name = id.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1); // Capitalize
  };

  // Load box chat từ json-server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/0");
        if (!response.ok) throw new Error("Không thể tải dữ liệu");
        const data = await response.json();
        console.log("Dữ liệu từ json-server:", data);
        setBoxData(data);
        setError(null);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        setError("Không thể tải tin nhắn. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Scroll xuống cuối khi boxData thay đổi
  useEffect(() => {
    if (boxData && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [boxData]);

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  // Gửi tin nhắn
  const onSend = async () => {
    if (myMessage.trim()) {
      const now = new Date().toISOString();
      const myMsg = {
        chatMessageId: Math.random().toString(), // Cảnh báo: nên dùng uuid
        chatMessageContent: myMessage,
        createdBy: currentUserId || "anonymous",
        createdAt: now,
      };

      try {
        const response = await fetch("http://localhost:3001/0");
        if (!response.ok) throw new Error("Không thể lấy dữ liệu");
        const currentBox = await response.json();

        // Cập nhật users nếu cần
        const existUser = currentBox.users.find((u) => u.id === currentUserId);
        if (!existUser && currentUserId) {
          currentBox.users.push({
            boxChatUserId: "u_" + currentUserId.slice(-4),
            id: currentUserId,
            name: formatName(currentUserId),
            avatar: avatarDefault, // Thêm avatar mặc định cho user mới
          });
        }

        // Thêm tin nhắn
        currentBox.messages.push(myMsg);

        // Lưu lại
        const saveResponse = await fetch("http://localhost:3001/0", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentBox),
        });

        if (saveResponse.ok) {
          setBoxData(currentBox);
          setMyMessage("");
          setError(null);
        } else {
          throw new Error("Không thể lưu tin nhắn");
        }
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        setError("Không thể gửi tin nhắn. Vui lòng thử lại.");
      }
    }
  };

  const users = boxData?.users || [];

  return (
    <div className="chat__window">
      <div className="chat__page__container">
        <div className="chat__heading">
          <div className="chat__heading__left">
            <img src={avatarDefault} alt="Group Avatar" />
            <div className="chat__heading__userinfor">
              <h2>{boxData?.boxChat?.nameBox || "StackLog"}</h2>
            </div>
            {selectedUser?.isOnline && <div className="online_dot"></div>}
          </div>
          <div className="chat__heading__right">
            <i className="fa-solid fa-phone"></i>
            <i className="fa-solid fa-video"></i>
          </div>
        </div>
        <div style={{ padding: "8px 32px" }}>
          {/* <b>Đăng nhập: {formatName(currentUserId)}</b> */}
        </div>
        {error && (
          <div style={{ padding: "8px", color: "red", textAlign: "center" }}>
            {error}
          </div>
        )}
        <div className="chat__content--scroll" ref={scrollRef}>
          {loading ? (
            <p style={{ textAlign: "center" }}>Đang tải tin nhắn...</p>
          ) : boxData?.messages && boxData.messages.length > 0 ? (
            [...boxData.messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg) => {
                const isMe = msg.createdBy === currentUserId;
                const sender = users.find((u) => u.id === msg.createdBy) || {
                  name: formatName(msg.createdBy),
                  avatar: avatarDefault,
                };
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
                        src={sender.avatar || avatarDefault}
                        alt={sender.name}
                      />
                    )}
                    <div
                      className={`chat__message ${
                        isMe ? "chat__message--right" : "chat__message--left"
                      }`}
                    >
                      <div className="chat__message__info">
                        <span className="chat__message__name">
                          {sender.name}
                        </span>
                        <span className="chat__message__time">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                      <div className="chat__message__content">
                        {msg.chatMessageContent}
                      </div>
                    </div>
                    {isMe && (
                      <img
                        className="chat__message__avatar"
                        src={sender.avatar || avatarDefault}
                        alt={sender.name}
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
              <img src={errorIcon} alt="error" />
              <img src={fileIcon} alt="file" />
              <img src={attachmentIcon} alt="attachment" />
              <img src={smileIcon} alt="smile" />
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
