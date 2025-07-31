"use client"

import { useContext, useState, useEffect, useRef } from "react"
import fileIcon from "../../../assets/chatPageIcon/file_open.png"
import attachmentIcon from "../../../assets/chatPageIcon/attachment.png"
import smileIcon from "../../../assets/chatPageIcon/smile.png"
import avatarDefault from "../../../assets/ava-chat.png"
import "./ChatWindow.scss"
import { ChatContext } from "../../../context/ChatContext"
import { useAuth } from "../../../context/AuthProvider"
import { jwtDecode } from "jwt-decode"

const ChatWindow = () => {
  const { selectedUser, selectedBox, setSelectedBox, toggleFeatureChat, isFeatureChatOpen } = useContext(ChatContext)
  const { user } = useAuth()
  const [myMessage, setMyMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [lastMessageCount, setLastMessageCount] = useState(0)
  const scrollRef = useRef(null)
  const scrollTimeoutRef = useRef(null)

  // Lấy id/email user hiện tại từ JWT token
  let currentUserId = ""
  if (user?.token) {
    try {
      const decoded = jwtDecode(user.token)
      currentUserId = decoded.email || decoded.username || decoded.id || ""
    } catch (e) {
      console.error("Lỗi decode JWT:", e)
    }
  }

  // Format tên thân thiện
  const formatName = (id) => {
    if (!id) return "Anonymous"
    const name = id.split("@")[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Kiểm tra xem user có đang scroll hay không
  const handleScroll = () => {
    if (!scrollRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 10

    // Nếu user không ở cuối thì đang scroll
    setIsUserScrolling(!isAtBottom)

    // Clear timeout cũ và set timeout mới
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Sau 2 giây không scroll thì reset trạng thái
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 2000)
  }

  // Load box chat từ json-server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/0")
        if (!response.ok) throw new Error("Không thể tải dữ liệu")
        const data = await response.json()
        setSelectedBox(data)
        setError(null)
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error)
        setError("Không thể tải tin nhắn. Vui lòng thử lại sau.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const intervalId = setInterval(fetchData, 1000)
    return () => {
      clearInterval(intervalId)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [setSelectedBox])

  // Chỉ scroll xuống cuối khi có tin nhắn mới và user không đang scroll
  useEffect(() => {
    if (selectedBox?.messages && scrollRef.current) {
      const currentMessageCount = selectedBox.messages.length

      // Nếu có tin nhắn mới và user không đang scroll thì mới scroll xuống
      if (currentMessageCount > lastMessageCount && !isUserScrolling) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }

      setLastMessageCount(currentMessageCount)
    }
  }, [selectedBox?.messages, isUserScrolling, lastMessageCount])

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    return isToday
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
  }

  // Gửi tin nhắn
  const onSend = async () => {
    if (myMessage.trim()) {
      const now = new Date().toISOString()
      const myMsg = {
        chatMessageId: Math.random().toString(),
        chatMessageContent: myMessage,
        createdBy: currentUserId || "anonymous",
        createdAt: now,
      }

      try {
        const response = await fetch("http://localhost:3001/0")
        if (!response.ok) throw new Error("Không thể lấy dữ liệu")
        const currentBox = await response.json()

        const existUser = currentBox.users.find((u) => u.id === currentUserId)
        if (!existUser && currentUserId) {
          currentBox.users.push({
            boxChatUserId: "u_" + currentUserId.slice(-4),
            id: currentUserId,
            name: formatName(currentUserId),
            avatar: avatarDefault,
          })
        }

        currentBox.messages.push(myMsg)

        const saveResponse = await fetch("http://localhost:3001/0", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentBox),
        })

        if (saveResponse.ok) {
          setSelectedBox(currentBox)
          setMyMessage("")
          setError(null)
          // Khi gửi tin nhắn thì luôn scroll xuống cuối
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
          }, 100)
        } else {
          throw new Error("Không thể lưu tin nhắn")
        }
      } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error)
        setError("Không thể gửi tin nhắn. Vui lòng thử lại sau.")
      }
    }
  }

  const handleAtIconClick = () => {
    toggleFeatureChat()
  }

  const users = selectedBox?.users || []

  return (
    <div className="chat__window">
      <div className="chat__page__container">
        <div className="chat__heading">
          <div className="chat__heading__left">
            <img src={avatarDefault || "/placeholder.svg"} alt="Group Avatar" />
            <div className="chat__heading__userinfor">
              <h2>{selectedBox?.boxChat?.nameBox || "StackLog"}</h2>
            </div>
            {selectedUser?.isOnline && <div className="online_dot"></div>}
          </div>
          <div className="chat__heading__right">
            <i className="fa-solid fa-phone"></i>
            <i className="fa-solid fa-video"></i>
            <i className="fa-solid fa-circle-info" onClick={toggleFeatureChat}></i>
          </div>
        </div>

        {error && <div style={{ padding: "8px", color: "red", textAlign: "center" }}>{error}</div>}

        <div className="chat__content--scroll" ref={scrollRef} onScroll={handleScroll}>
          {loading ? (
            <p style={{ textAlign: "center" }}>Đang tải tin nhắn...</p>
          ) : selectedBox?.messages && selectedBox.messages.length > 0 ? (
            [...selectedBox.messages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg) => {
                const isMe = msg.createdBy === currentUserId
                const sender = users.find((u) => u.id === msg.createdBy) || {
                  name: formatName(msg.createdBy),
                  avatar: avatarDefault,
                }

                return (
                  <div
                    key={msg.chatMessageId}
                    className={`chat__message__row ${isMe ? "chat__message__row--right" : "chat__message__row--left"}`}
                  >
                    {!isMe && (
                      <img className="chat__message__avatar" src={sender.avatar || avatarDefault} alt={sender.name} />
                    )}
                    <div className={`chat__message ${isMe ? "chat__message--right" : "chat__message--left"}`}>
                      <div className="chat__message__info">
                        <span className="chat__message__name">{sender.name}</span>
                        <span className="chat__message__time">{formatTime(msg.createdAt)}</span>
                      </div>
                      <div className="chat__message__content">{msg.chatMessageContent}</div>
                    </div>
                    {isMe && (
                      <img className="chat__message__avatar" src={sender.avatar || avatarDefault} alt={sender.name} />
                    )}
                  </div>
                )
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
              <img src={attachmentIcon || "/placeholder.svg"} alt="attachment" />
              <img src={smileIcon || "/placeholder.svg"} alt="smile" />
            </div>
            <div className="send__message" onClick={onSend}>
              <i className="fa-regular fa-paper-plane"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow
