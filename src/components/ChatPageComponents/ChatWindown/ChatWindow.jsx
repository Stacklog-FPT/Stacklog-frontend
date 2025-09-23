import React, { useEffect, useState, useRef, useContext } from "react";
import useSocketChat from "../../../hooks/ueSocket";
import { ChatContext } from "../../../context/ChatContext";
import { useAuth } from "../../../context/AuthProvider";
import { jwtDecode } from "jwt-decode";
import avatarDefault from "../../../assets/ava-chat.png";
import fileIcon from "../../../assets/chatPageIcon/file_open.png";
import attachmentIcon from "../../../assets/chatPageIcon/attachment.png";
import smileIcon from "../../../assets/chatPageIcon/smile.png";
import userApi from "../../../service/UserService";
import "./ChatWindow.scss";
import chatApi from "../../../service/ChatService";
import { REACT_API_URL } from "../../../api/apiConfig";

// derive socket endpoint from API base. Some servers mount socket.io at
// the HTTP root (e.g. /socket.io) while the REST API is under /api.
// If REACT_API_URL contains `/api`, strip it so the socket path becomes
// ws://host[:port]/socket.io which matches the inspector URL.
// Build SOCKET_URL using the API origin so we connect to
// ws://<host>/api/chat/socket.io (matches server path)
let apiOrigin = REACT_API_URL;
try {
  apiOrigin = new URL(REACT_API_URL).origin;
} catch (e) {
  // fallback: strip path, keep host
  apiOrigin = REACT_API_URL.replace(/\/.*$/, "");
}
const socketScheme = apiOrigin.replace(/^http/, "ws");
const SOCKET_URL = socketScheme + "/api/chat/socket.io";

const ChatWindow = () => {
  const { selectedBox, setSelectedBox, toggleFeatureChat } =
    useContext(ChatContext);
  const { user } = useAuth();
  const { getUserById } = userApi();
  const [myMessage, setMyMessage] = useState("");
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [messages, setMessages] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const scrollRef = useRef(null);
  const menuClickRef = useRef(null);

  // click-away: close msg menu when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      // if there's no open menu, nothing to do
      if (!openMenuId) return;
      // find the closest .msg-more-container; if it's null or its data-msg-id !== openMenuId, close
      const el = e.target.closest?.(".msg-more-container");
      if (!el || el.getAttribute("data-msg-id") !== openMenuId) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [openMenuId]);

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

  // Kết nối socket
  // handle incoming socket message: map server shape -> UI shape and dedupe
  // helper to normalize server-side state strings into UI states
  const normalizeState = (s) => {
    if (!s) return "SENT";
    const up = String(s).toUpperCase();
    if (up === "DELETED" || up === "DELETED_BY_ME" || up === "DELETE") return "DELETE";
    if (up === "RECALLED" || up === "RECALL" || up === "RECALLED_BY_ME") return "RECALL";
    if (up === "SENT" || up === "DELIVERED" || up === "READ") return "SENT";
    return up;
  };

  const handleSocketMessage = (raw) => {
    if (!raw) return;
    // debug: show raw socket payload for diagnosis
    try {
      // eslint-disable-next-line no-console
      console.debug("[ChatWindow] socket raw:", raw);
    } catch (e) {}
    const id = raw.chat_message_id || raw._id || raw.chatMessageId;
    const mapped = {
      chatMessageId: id || Math.random().toString(),
      chatMessageContent:
        raw.content || raw.chat_message_content || raw.chatMessageContent || "",
      createdBy: raw.sender_id || raw.created_by || raw.createdBy || "",
      createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
      groupId:
        raw.box_chat_id || raw.box_chatId || raw.groupId || selectedBox?.id,
      // normalize state: server may send `state`, `status` or `message_state`
  state: normalizeState(raw.state || raw.status || raw.message_state),
    };

    setMessages((prev) => {
      // if message exists -> merge state (update), otherwise append
      const idx = prev.findIndex((m) => m.chatMessageId === mapped.chatMessageId);
      if (idx === -1) return [...prev, mapped];
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...mapped };
      return copy;
    });
  };

  const {
    sendMessage: socketSend,
    connected,
    joined,
    events,
    emit: socketEmit,
  } = useSocketChat(
    SOCKET_URL,
    selectedBox?.id,
    handleSocketMessage,
    (msgs) => {
      // optional: map array of raw messages from socket if server emits history
      const mapped = (msgs || []).map((m) => ({
        chatMessageId:
          m.chat_message_id ||
          m._id ||
          m.chatMessageId ||
          Math.random().toString(),
        chatMessageContent: m.content || m.chat_message_content || "",
        createdBy: m.sender_id || m.created_by || m.createdBy || "",
        createdAt: m.created_at || m.createdAt || new Date().toISOString(),
        groupId: selectedBox?.id,
  state: normalizeState(m.state || m.status || m.message_state),
      }));
      setMessages(mapped);
    },
    currentUserId
  );

  // Load saved messages from REST when selectedBox changes
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      "[ChatWindow] selectedBox id",
      selectedBox?.id,
      "socket connected/joined:",
      connected,
      joined
    );
    let mounted = true;
    const loadHistory = async () => {
      if (!selectedBox?.id || !user?.token) return;
      try {
        const service = chatApi();
        const msgs = await service.getMessages(user.token, selectedBox.id);
        // map server fields to UI fields used in this component
        const mapped = (msgs || []).map((m) => ({
          chatMessageId: m._id || m.chatMessageId || Math.random().toString(),
          chatMessageContent: m.content || m.chat_message_content || "",
          createdBy: m.createdBy || m.created_by || m.senderId || "",
          createdAt:
            m.createdAt ||
            m.created_at ||
            m.timestamp ||
            new Date().toISOString(),
          groupId: selectedBox.id,
          state: normalizeState(m.state || m.status || m.message_state),
        }));
        if (mounted) setMessages(mapped);
      } catch (err) {
        console.error("Load messages failed", err);
      }
    };
    loadHistory();
    return () => {
      mounted = false;
    };
  }, [selectedBox?.id, user?.token]);

  // Gửi tin nhắn qua REST API (vẫn giữ socket để nhận)
  const onSend = async () => {
    if (
      !myMessage.trim() ||
      !selectedBox?.id ||
      !selectedBox?.members?.includes(currentUserId)
    )
      return;

    const payload = {
      content: myMessage,
      attachment: null,
      mentionUserIds: [],
    };

    // optimistic UI: show message immediately
    const now = new Date().toISOString();
    const optimistic = {
      chatMessageId: Math.random().toString(),
      chatMessageContent: myMessage,
      createdBy: currentUserId || "anonymous",
      createdAt: now,
      groupId: selectedBox.id,
      pending: true,
      state: "SENT",
    };
    setMessages((prev) => [...prev, optimistic]);
    setMyMessage("");

    try {
      const service = chatApi();
      const res = await service.sendMessage(
        user.token,
        selectedBox.id,
        payload
      );
      // server should return saved message; replace optimistic message if possible
      const saved = res || {};
      const savedMsg = {
        chatMessageId:
          saved._id ||
          saved.chat_message_id ||
          saved.chatMessageId ||
          Math.random().toString(),
        chatMessageContent: saved.content || payload.content,
        createdBy: saved.sender_id || saved.createdBy || currentUserId,
        createdAt:
          saved.createdAt || saved.created_at || new Date().toISOString(),
        groupId: selectedBox.id,
        state: normalizeState(saved.state || saved.status || saved.message_state),
      };

      setMessages((prev) => {
        // remove optimistic copy and any existing message with the same saved id
        const withoutOptimistic = prev.filter(
          (m) =>
            m.chatMessageId !== optimistic.chatMessageId &&
            m.chatMessageId !== savedMsg.chatMessageId
        );
        return [...withoutOptimistic, savedMsg];
      });
    } catch (err) {
      console.error("Send message failed", err);
      // remove optimistic message and show error
      setMessages((prev) =>
        prev.filter((m) => m.chatMessageId !== optimistic.chatMessageId)
      );
      setError("Gửi tin nhắn thất bại");
    }
  };

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
    if (!messages) return;
    const ids = [...new Set(messages.map((msg) => msg.createdBy))];
    ids.forEach((id) => fetchUser(id));
    // eslint-disable-next-line
  }, [messages]);

  // Handlers for own-message actions
  const handleDeleteMessage = async (msg) => {
    if (!msg || !msg.chatMessageId) return;
    if (!user?.token) return;
    try {
      const api = chatApi();
      await api.deleteMessage(user.token, msg.chatMessageId);
      // mark as deleted for this client — server may already send back a state update
      setMessages((prev) =>
        prev.map((m) =>
          m.chatMessageId === msg.chatMessageId ? { ...m, state: "DELETE" } : m
        )
      );
      // notify server via socket that this message changed state (best-effort)
      try {
        socketEmit && socketEmit("message:updated", {
          messageId: msg.chatMessageId,
          state: "DELETE",
          boxId: selectedBox?.id,
        });
      } catch (e) {}
      setOpenMenuId(null);
    } catch (e) {
      console.error("Delete message failed", e);
    }
  };

  const handleRecallMessage = async (msg) => {
    if (!msg || !msg.chatMessageId) return;
    if (!user?.token) return;
    try {
      const api = chatApi();
      await api.recallMessage(user.token, msg.chatMessageId);
      // mark as recalled so UI shows the "recalled" placeholder
      setMessages((prev) =>
        prev.map((m) =>
          m.chatMessageId === msg.chatMessageId ? { ...m, state: "RECALL" } : m
        )
      );
      // notify server so it can broadcast to other clients
      try {
        socketEmit && socketEmit("message:updated", {
          messageId: msg.chatMessageId,
          state: "RECALL",
          boxId: selectedBox?.id,
        });
      } catch (e) {}
      setOpenMenuId(null);
    } catch (e) {
      console.error("Recall message failed", e);
    }
  };

  // Click-away: close menu if clicking outside any .msg-more-container
  useEffect(() => {
    const handler = (e) => {
      // if no menu is open do nothing
      if (!openMenuId) return;
      // find closest msg-more-container from event target
      const inside = e.target.closest && e.target.closest('.msg-more-container');
      if (!inside) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openMenuId]);

  return (
    <div className="chat__window">
      <div className="chat__page__container">
        <div className="chat__heading">
          <div className="chat__heading__left">
            <img
              src={selectedBox?.boxChat?.avaBox || "/placeholder.svg"}
              alt="Group Avatar"
            />
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
          {messages && messages.length > 0 ? (
            [...messages]
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

                // If the message was deleted (DELETE) it should not be shown to the deleter
                if (isMe && msg.state === "DELETE") return null;

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

                    {/* 3-dot button only for my messages — render before the bubble */}
                    {isMe && msg.state === "SENT" && (
                      <div className="msg-more-container" data-msg-id={msg.chatMessageId}>
                        <button
                          className="msg-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === msg.chatMessageId ? null : msg.chatMessageId);
                          }}
                          aria-label="More"
                          aria-expanded={openMenuId === msg.chatMessageId}
                        >
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                        {openMenuId === msg.chatMessageId && (
                          <div className="msg-more-menu">
                            <button onClick={() => handleDeleteMessage(msg)}>Delete message</button>
                            <button onClick={() => handleRecallMessage(msg)}>Recall message</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Render message content or recalled placeholder */}
                    {msg.state === "RECALL" ? (
                      <div className={`chat__message ${isMe ? "chat__message--right" : "chat__message--left"}`}>
                        <div className="chat__message__info">
                          <span className="chat__message__name">{senderName}</span>
                          <span className="chat__message__time">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="chat__message__content">Đã thu hồi tin nhắn</div>
                      </div>
                    ) : (
                      <div
                        className={`chat__message ${
                          isMe ? "chat__message--right" : "chat__message--left"
                        }`}
                      >
                        <div className="chat__message__info">
                          <span className="chat__message__name">{senderName}</span>
                          <span className="chat__message__time">{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="chat__message__content">{msg.chatMessageContent}</div>
                      </div>
                    )}
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
