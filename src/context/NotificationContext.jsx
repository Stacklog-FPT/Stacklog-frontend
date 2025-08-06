import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  console.log(notifications)
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (stompClientRef.current) {
      console.log("🔄 STOMP client already exists, skipping initialization");
      return;
    }

    const socket = new WebSocket(
      "ws://103.166.183.142:8080/api/notification/ws"
    );
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log("STOMP Debug:", str);
      },
    });

    stompClientRef.current = stompClient;

    stompClient.onConnect = (frame) => {
      console.log("✅ Connected to WebSocket", frame);
      stompClient.subscribe("/topic/notification", (message) => {
        console.log("🔔 Received message:", message.body);
        try {
          const rawNotification = JSON.parse(message.body);

          const newNotification = {
            _id: rawNotification.taskAssignId,
            title: `Task assigned to ${rawNotification.assignTo}`,
            author: {
              name: rawNotification.createdBy,
              avatar: "default-avatar.png",
            },
            isRead: false,
            createdAt: Array.isArray(rawNotification.createdAt)
              ? new Date(
                  rawNotification.createdAt[0],
                  rawNotification.createdAt[1] - 1,
                  rawNotification.createdAt[2],
                  rawNotification.createdAt[3],
                  rawNotification.createdAt[4],
                  rawNotification.createdAt[5],
                  Math.floor(rawNotification.createdAt[6] / 1000000)
                ).toISOString()
              : rawNotification.createdAt,
          };
          setNotifications((prev) => {
            if (prev.some((item) => item._id === newNotification._id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
        } catch (e) {
          console.error("Error parsing WebSocket message:", e.message);
        }
      });
    };

    stompClient.onStompError = (frame) => {
      console.error("STOMP Error:", frame);
    };

    stompClient.onDisconnect = () => {
      console.log("🔌 Disconnected from WebSocket");
    };

    stompClient.onWebSocketClose = (event) => {
      console.error("WebSocket Closed:", event);
    };

    console.log("🚀 Activating STOMP client");
    stompClient.activate();

    return () => {
      console.log("🧹 Cleaning up STOMP client");
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        stompClientRef.current = null;
        console.log("🛑 STOMP client deactivated");
      }
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
