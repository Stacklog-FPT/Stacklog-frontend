import { createContext, useContext, useEffect, useRef, useState } from "react";
import notificationSocket from "../service/NotificationSocketService";
import { SOCKET_BASE_URL } from "../api/apiConfig";
import { useAuth } from "./AuthProvider";
import { useDispatch } from "react-redux";
import { addNotifications } from "../redux/slice/notificationSlice";
import decodeToken from "../service/DecodeJwt";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !user.token) return; // wait for auth
    // Build socket URL
    // In dev: SOCKET_BASE_URL is '/api/' -> '/api/notification/socket.io' (Vite proxy)
    // In prod: SOCKET_BASE_URL is 'https://...' -> direct connection
    const NOTIFI_URL = SOCKET_BASE_URL.replace(/\/$/, '') + '/notification/socket.io';

    // derive userId for query: prefer explicit user._id, fall back to token decode
    const userId = (user && user._id) || decodeToken(user.token)?.id;

    try {
      console.debug('[NotificationContext] connecting to', NOTIFI_URL, 'userId=', userId);
      const sock = notificationSocket.connect({ url: NOTIFI_URL, token: user.token, query: { userId } });
      socketRef.current = sock;
      console.debug('[NotificationContext] socket returned', !!sock, sock && sock.id);

      // Try common event names. The backend might emit 'notification', 'notification:new', or 'notification:create'
      const handler = (payload) => {
        try {
          // socket.io might deliver payload as the data object, or as an array like ['notification', data]
          let notification = null;

          if (Array.isArray(payload) && payload.length >= 2) {
            // example: ["notification", { ... }]
            notification = payload[1];
          } else if (payload && payload.notification) {
            notification = payload.notification;
          } else {
            notification = payload;
          }

          if (!notification) return;

          // annotate so we can tell this was received via realtime socket
          const annotated = { ...notification, __receivedVia: 'socket' };

          // Dispatch to redux so Announcement.jsx (which reads from redux) receives updates
          dispatch(addNotifications(annotated));
          // Also update local context copy for consumers using context directly
          setNotifications((prev) => (prev.some((n) => n._id === annotated._id) ? prev : [annotated, ...prev]));
        } catch (e) {
          console.error("Failed to handle incoming notification payload", e);
        }
      };

      notificationSocket.on("notification", handler);
      notificationSocket.on("notification:new", handler);
      notificationSocket.on("notification:create", handler);
      // fallback to generic 'message' if backend uses that channel
      notificationSocket.on("message", handler);

      return () => {
        notificationSocket.off("notification", handler);
        notificationSocket.off("notification:new", handler);
        notificationSocket.off("notification:create", handler);
        notificationSocket.off("message", handler);
        socketRef.current = null;
        notificationSocket.disconnect();
      };
    } catch (e) {
      console.error("Notification socket connection failed", e);
    }
  }, [user, dispatch]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
