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
  const { selectedBox, setSelectedBox, toggleFeatureChat, setBoxesVersion } =
    useContext(ChatContext);
  const { user } = useAuth();
  const { getUserById } = userApi();
  const [myMessage, setMyMessage] = useState("");
  const [error, setError] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionedUserIds, setMentionedUserIds] = useState([]);
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
        // mark messages in this box as read for current user
        try {
          await service.markMessagesRead(user.token, selectedBox.id);
        } catch (e) {
          // non-fatal: still try to load messages
          console.warn("markMessagesRead failed:", e);
        }
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
          // preserve server read list (array of user ids)
          readBy: Array.isArray(m.read_by) ? m.read_by : m.readBy || [],
        }));
        if (mounted) setMessages(mapped);
        // prefetch reader user info (avatars) for any readBy ids
        const allReaderIds = new Set();
        mapped.forEach((mm) => (mm.readBy || []).forEach((id) => allReaderIds.add(id)));
        Array.from(allReaderIds).forEach((id) => {
          if (!id) return;
          // fetch and cache user info using existing fetchUser helper
          fetchUser(id);
        });
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

    // defensive: ensure current user id is never sent in mentionUserIds
    const cleanMentionUserIds = (mentionedUserIds || []).filter(
      (id) => id && id !== currentUserId
    );

    const payload = {
      content: myMessage,
      attachment: null,
      mentionUserIds: cleanMentionUserIds,
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
      mentionUserIds: cleanMentionUserIds,
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
        // prefer server-returned mention list, fallback to the cleaned payload we sent
        mentionUserIds: Array.isArray(saved.mentionUserIds)
          ? saved.mentionUserIds.filter((id) => id && id !== currentUserId)
          : cleanMentionUserIds,
      };

      setMessages((prev) => {
        // remove optimistic copy and any existing message with the same saved id
        const withoutOptimistic = prev.filter(
          (m) =>
            m.chatMessageId !== optimistic.chatMessageId &&
            m.chatMessageId !== savedMsg.chatMessageId
        );
        // reset mention tracking for next message
        setMentionedUserIds([]);
        // notify outer list (groups/boxes) to refresh preview of last message
        try {
          if (typeof setBoxesVersion === "function") setBoxesVersion((v) => (v || 0) + 1);
        } catch (e) {}
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

  // Start an audio/video call for the current box (frontend-only option)
  // Uses the public Jitsi Meet server so no backend changes are required.
  const startCall = async (type = "video") => {
    try {
      if (!selectedBox || !selectedBox.id) return alert("No chat selected for call");

  // Use a unique room name per call so old links cannot be reused to restart
  // the same meeting session. This prevents someone opening an old link
  // and recreating the previous meeting state.
  const roomName = `stacklog-${selectedBox.id}-${Date.now()}`;

      // Build Jitsi Meet public room URL (meet.jit.si)
      const base = `https://meet.jit.si/${encodeURIComponent(roomName)}`;
      // Customize query/hash params as needed (e.g. startWithAudioMuted)
      const jitsiUrl = `${base}#room=${encodeURIComponent(roomName)}&config.startWithVideoMuted=false&config.startWithAudioMuted=false`;

      // Try to copy the link to clipboard so user can paste/share
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(jitsiUrl);
        }
      } catch (e) {
        // non-fatal
        console.warn('Clipboard write failed', e);
      }

      // Optionally send a chat message containing the meeting link so other members see it
      try {
        const service = chatApi();
        // mention everyone in the box except the caller so they get notified
        const allMentionIds = (selectedBox?.members || []).filter((id) => id && id !== currentUserId);
        const payload = {
          content: `📞 Cuộc gọi ${type} — tham gia: ${jitsiUrl}`,
          attachment: null,
          mentionUserIds: allMentionIds,
        };
        // fire-and-forget: we don't need to await or block UX; errors are non-fatal
        service.sendMessage(user.token, selectedBox.id, payload).catch((err) => {
          console.warn('Failed to send meeting link message', err);
        });
      } catch (e) {}

      // Emit a socket invite if you still have realtime handling on server — harmless if server ignores it
      try {
        const mentionIds = (selectedBox?.members || []).filter((id) => id && id !== currentUserId);
        const payload = {
          roomId: roomName,
          boxId: selectedBox.id,
          type,
          from: currentUserId,
          timestamp: new Date().toISOString(),
          mentionUserIds: mentionIds,
        };
        socketEmit && socketEmit("call:invite", payload);
      } catch (e) {
        console.warn("call:invite emit failed", e);
      }

      // Open the Jitsi room in a new tab so the caller stays in chat
      window.open(jitsiUrl, "_blank");
    } catch (e) {
      console.error("Start call failed", e);
      alert("Khởi tạo cuộc gọi thất bại");
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

  // Pre-fetch members of the selected box so mention suggestions can show
  useEffect(() => {
    if (!selectedBox?.members || !Array.isArray(selectedBox.members)) return;
    // build mention suggestion list but exclude current user
    const items = (selectedBox.members || [])
      .filter((id) => id && id !== currentUserId)
      .map((id) => {
      const info = userCache[id] || {};
      return {
        id,
        display: info.full_name || info.email || id,
        avatar: info.avatar_link ? `https://stacklog.id.vn/${info.avatar_link}` : avatarDefault,
      };
    });
    setMentionSuggestions(items);
    // ensure cache is filled
    selectedBox.members.forEach((id) => fetchUser(id));
  }, [selectedBox?.members, userCache]);

  // Handle typing in input to detect '@' trigger for mentions
  const handleInputChange = (e) => {
    const v = e.target.value;
    setMyMessage(v);
    const at = v.lastIndexOf("@");
    if (at === -1) {
      setShowMentionList(false);
      setMentionQuery("");
      return;
    }
    const before = at === 0 ? " " : v[at - 1];
    if (before && !/\s/.test(before)) {
      setShowMentionList(false);
      setMentionQuery("");
      return;
    }
    const q = v.slice(at + 1);
    if (/\s/.test(q)) {
      setShowMentionList(false);
      setMentionQuery("");
      return;
    }
    setMentionQuery(q);
    setShowMentionList(true);
  };

  const selectMention = (item) => {
    if (!item) return;
    const v = myMessage;
    const at = v.lastIndexOf("@");
    let newText;
    if (at === -1) newText = v + `@${item.display} `;
    else newText = v.slice(0, at) + `@${item.display} `;
    setMyMessage(newText);
    setShowMentionList(false);
    setMentionQuery("");
    // do not add current user to mentionedUserIds
    if (item.id && item.id !== currentUserId) {
      setMentionedUserIds((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
    } else {
      // ensure currentUserId is not present
      setMentionedUserIds((prev) => prev.filter((id) => id !== currentUserId));
    }
  };

  // Khi có tin nhắn mới, fetch thông tin user nếu chưa có
  useEffect(() => {
    if (!messages) return;
    const ids = [...new Set(messages.map((msg) => msg.createdBy))];
    ids.forEach((id) => fetchUser(id));
    // eslint-disable-next-line
  }, [messages]);

  // Render message content with mention highlights
  const renderMessageContent = (msg) => {
    const text = msg.chatMessageContent || "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // If this message looks like a meeting/call (contains meet.jit.si or is prefixed with the call emoji),
    // render a nicer call card instead of the raw long link.
    const isCallLink = /meet\.jit\.si/i.test(text) || /^\s*📞\s*Cuộc gọi/i.test(text) || (typeof text === 'string' && text.startsWith('CALL::'));
    if (isCallLink) {
      // extract first URL if present
      const match = text.match(urlRegex);
      const url = match ? match[0] : null;
      const senderInfo = userCache[msg.createdBy] || {};
      const senderName = senderInfo.full_name || senderInfo.email || msg.createdBy;
      const time = new Date(msg.createdAt).toLocaleString();
      // try to detect type from text (audio/video)
      const type = /audio/i.test(text) ? 'audio' : 'video';

      return (
        <div className="chat__call">
          <div className="chat__call__meta">
            <div className="chat__call__initiator">
              <div className="chat__call__initiator_name">{senderName}</div>
              <div className="chat__call__initiator_time">{time}</div>
            </div>
            <div className="chat__call__icon">
              <i className={`fa-solid ${type === 'audio' ? 'fa-phone' : 'fa-video'}`}></i>
            </div>
          </div>
          <div className="chat__call__body">
            <div className="chat__call__title">Cuộc gọi {type === 'audio' ? 'âm thanh' : 'video'}</div>
            {url && (
              <div className="chat__call__sub">
                <a href={url} target="_blank" rel="noopener noreferrer" className="chat__call__link">Tham gia cuộc gọi</a>
              </div>
            )}
            <div className="chat__call__actions">
              <button className="chat__call__retry" onClick={() => startCall(type)}>Gọi lại</button>
            </div>
          </div>
        </div>
      );
    }

    // Fallback: render as regular message with URL highlighting
    const segments = text.split(urlRegex);
    return segments.map((seg, i) => {
      if (!seg) return null;
      // if this segment is a URL, render anchor
      if (/^https?:\/\//i.test(seg)) {
        return (
          <a
            key={`url-${i}`}
            href={seg}
            target="_blank"
            rel="noopener noreferrer"
            className="chat__link"
          >
            {seg}
          </a>
        );
      }

      // otherwise handle mentions and plain text (preserve spaces)
      const parts = seg.split(/(\s+)/);
      return parts.map((part, idx) => {
        if (!part) return null;
        if (!part.startsWith("@")) return <span key={`t-${i}-${idx}`}>{part}</span>;
        const token = part.slice(1).replace(/[.,!?;:]$/, ""); // strip trailing punctuation
        // find cached user whose display matches token (case-insensitive)
        const matchId = Object.keys(userCache).find((id) => {
          const info = userCache[id] || {};
          const name = (info.full_name || info.email || id).toLowerCase();
          return name === token.toLowerCase();
        });
        if (matchId) {
          const info = userCache[matchId] || {};
          const name = info.full_name || info.email || matchId;
          return (
            <span key={`m-${i}-${idx}`} className="chat__mention">
              @{name}
            </span>
          );
        }
        return <span key={`t-${i}-${idx}`}>{part}</span>;
      });
    });
  };

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
            <i className="fa-solid fa-phone" onClick={() => startCall('audio')} style={{ cursor: 'pointer' }}></i>
            <i className="fa-solid fa-video" onClick={() => startCall('video')} style={{ cursor: 'pointer' }}></i>
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
                        {/* readers (who saw this message) */}
                        {(msg.readBy && msg.readBy.length > 0) && (
                          <div className="chat__message__readers">
                            {Array.from(new Set(msg.readBy))
                              .filter((id) => id && id !== msg.createdBy)
                              .map((readerId) => {
                                const info = userCache[readerId] || {};
                                const avatar = info.avatar_link
                                  ? `https://stacklog.id.vn/${info.avatar_link}`
                                  : avatarDefault;
                                const name = info.full_name || info.email || readerId;
                                return (
                                  <span key={readerId} className="chat__message__reader_wrapper">
                                    <img
                                      className="chat__message__reader_avatar"
                                      src={avatar}
                                      alt={name}
                                    />
                                    <span className="chat__message__reader_name">{name}</span>
                                  </span>
                                );
                              })}
                          </div>
                        )}
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
                        <div className="chat__message__content">{renderMessageContent(msg)}</div>
                        {/* readers (who saw this message) */}
                        {(msg.readBy && msg.readBy.length > 0) && (
                          <div className="chat__message__readers">
                            {Array.from(new Set(msg.readBy))
                              .filter((id) => id && id !== msg.createdBy)
                              .map((readerId) => {
                                const info = userCache[readerId] || {};
                                const avatar = info.avatar_link
                                  ? `https://stacklog.id.vn/${info.avatar_link}`
                                  : avatarDefault;
                                const name = info.full_name || info.email || readerId;
                                return (
                                  <span key={readerId} className="chat__message__reader_wrapper">
                                    <img
                                      className="chat__message__reader_avatar"
                                      src={avatar}
                                      alt={name}
                                    />
                                    <span className="chat__message__reader_name">{name}</span>
                                  </span>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    )}
                    {isMe && (
                      <img
                        className="chat__message__avatar"
                        src={senderAvatar}
                        alt={senderName}
                      />
                    )}
                    {/* render avatars of users who have read this message */}
                    
                  </div>
                );
              })
          ) : (
            <p style={{ textAlign: "center" }}>Chưa có tin nhắn</p>
          )}
        </div>

        <div className="chat__footer">
          <div className="chat__input_wrapper">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              value={myMessage}
              onChange={handleInputChange}
              onKeyUp={(e) => e.key === "Enter" && onSend()}
            />

            {showMentionList && (
              <div className="chat__mention_suggestions">
                {mentionSuggestions
                  .filter((s) => s.display.toLowerCase().includes((mentionQuery || "").toLowerCase()))
                  .slice(0, 6)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="chat__mention_item"
                      onClick={() => selectMention(s)}
                    >
                      <img src={s.avatar} alt={s.display} />
                      <span>{s.display}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
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
