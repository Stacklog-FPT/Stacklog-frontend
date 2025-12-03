import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

// Hook: connect to socket server, join a room, listen for new messages
// server uses Engine.IO/socket.io framing: emit "room:join" with roomId and
// broadcasts "message:new" for new messages.
export default function useSocketChat(
  serverUrl,
  roomId,
  onMessage,
  onHistory,
  userId
) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [joined, setJoined] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!serverUrl || !roomId) return;

    // Build socket.io client options
    const opts = {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
      transports: ['polling', 'websocket'],
      withCredentials: true,
    };

    // Handle both relative URLs (dev: '/api/chat/socket.io') and full URLs (prod: 'wss://...')
    let connectUrl = serverUrl;
    let pathOption;

    // If serverUrl is a full URL (ws://, wss://, http://, https://), parse it
    if (serverUrl.match(/^(ws|wss|http|https):\/\//)) {
      try {
        const parsed = new URL(serverUrl);
        // Convert ws/wss to http/https for socket.io-client
        if (parsed.protocol === 'ws:') parsed.protocol = 'http:';
        if (parsed.protocol === 'wss:') parsed.protocol = 'https:';
        connectUrl = `${parsed.protocol}//${parsed.host}`;
        pathOption = parsed.pathname + (parsed.search || '');
        opts.path = pathOption;
      } catch (e) {
        console.warn('[ueSocket] Failed to parse serverUrl', serverUrl, e);
      }
    } else {
      // Relative URL (dev): '/api/chat/socket.io' -> extract path for socket.io
      // Socket.io needs the path to be just '/api/chat/socket.io'
      connectUrl = window.location.origin; // connect to current origin
      opts.path = serverUrl; // use the relative path as-is
    }

    // Add userId to query AND auth for better compatibility
    if (userId) {
      opts.query = { userId };
      opts.auth = { token: userId }; // some backends expect token in auth
    }

    // helper to attach handlers to a socket instance
    let fallbackTimer = null;
    let attachedSocketId = null;
    const attachHandlers = (s) => {
      if (!s) return;
      attachedSocketId = s.id;

      const onConnect = () => {
        setConnected(true);
        try {
          // Try the common join signature: emit(roomId, ack)
          // eslint-disable-next-line no-console
          console.log("[ueSocket] emit room:join (string)", roomId);
          let acked = false;
          s.emit("room:join", roomId, (res) => {
            acked = true;
            setJoined(true);
            // eslint-disable-next-line no-console
            console.log("[ueSocket] room:join ack (string):", res);
            if (res && res.messages && onHistory) onHistory(res.messages);
          });

          setTimeout(() => {
            if (acked) return;
            try {
              // eslint-disable-next-line no-console
              console.log("[ueSocket] emit room:join (object)", { roomId });
              s.emit("room:join", { roomId }, (res2) => {
                setJoined(true);
                // eslint-disable-next-line no-console
                console.log("[ueSocket] room:join ack (object):", res2);
                if (res2 && res2.messages && onHistory) onHistory(res2.messages);
              });
            } catch (e) {}
          }, 1000);
        } catch (e) {
          // best-effort
        }
      };

      s.on("connect", onConnect);
      s.on("disconnect", (reason) => {
        // eslint-disable-next-line no-console
        console.log("[ueSocket] disconnect", reason);
        setConnected(false);
        setJoined(false);
      });
      s.on("connect_error", (err) => {
        // eslint-disable-next-line no-console
        console.error("[ueSocket] connect_error:", {
          message: err?.message,
          type: err?.type,
          description: err?.description,
          data: err?.data
        });
        setConnected(false);
      });

      // lightweight tracer for logging incoming events
      const tracer = (event, ...args) => {
        try {
          // eslint-disable-next-line no-console
          console.log(
            "[ueSocket] event",
            event,
            args && args.length === 1 ? args[0] : args
          );
          try {
            setEvents((prev) => [
              { ts: Date.now(), event, payload: args && args.length === 1 ? args[0] : args },
              ...prev,
            ].slice(0, 50));
          } catch (e) {}
        } catch (e) {}
      };
      if (s.onAny) s.onAny(tracer);

      // New message from server
      const handleNew = (msg) => {
        onMessage && onMessage(msg);
      };

  s.on("message:new", handleNew);
  // also listen for updates to existing messages (recall/delete/state changes)
  s.on("message:updated", handleNew);

      // optional: server may emit history but we prefer REST for history
      if (onHistory) {
        s.on("history", (msgs) => onHistory(msgs));
      }

      return { onConnect, tracer, handleNew };
    };

    // Create socket with full options (both websocket and polling enabled)
    console.log('[ueSocket] Connecting to', connectUrl, 'with opts', opts);
    socketRef.current = io(connectUrl, opts);
    const handlers = attachHandlers(socketRef.current);

    return () => {
      try {
        if (socketRef.current) socketRef.current.emit("room:leave", roomId);
      } catch (e) {}
      try {
        if (socketRef.current) {
          socketRef.current.removeAllListeners && socketRef.current.removeAllListeners();
          socketRef.current.disconnect();
        }
      } catch (e) {}
      socketRef.current = null;
    };
    // Reconnect if serverUrl, roomId or userId change
    // eslint-disable-next-line
  }, [serverUrl, roomId, userId]);

    const sendMessage = (msg) => {
      if (!socketRef.current) return;
      socketRef.current.emit("message:create", msg);
    };

    // generic emit helper so callers can notify server about updates (recall/delete/state)
    const emit = (event, payload) => {
      try {
        if (!socketRef.current) return;
        socketRef.current.emit(event, payload);
      } catch (e) {
        // swallow — best-effort
      }
    };

    return { sendMessage, emit, connected, joined, events };
}
