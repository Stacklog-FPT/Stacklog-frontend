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

  // We'll try websocket-first (so Network shows ws://...&transport=websocket)
  // but fall back to polling+upgrade if websocket handshake fails.
  const opts = { autoConnect: true, reconnection: true };

    // Normalize serverUrl: if it's a full ws(s) URL, convert to origin and put path in options
    let connectUrl = serverUrl;
    try {
      const parsed = new URL(serverUrl);
      // convert ws/wss to http/https so socket.io-client can use origin + path
      if (parsed.protocol === "ws:") parsed.protocol = "http:";
      if (parsed.protocol === "wss:") parsed.protocol = "https:";
      const origin = `${parsed.protocol}//${parsed.host}`;
      const pathAndQuery = parsed.pathname + (parsed.search || "");
      opts.path = pathAndQuery;
      connectUrl = origin;
    } catch (e) {
      // keep serverUrl as-is if it's not a full URL
      connectUrl = serverUrl;
    }

    // add userId to query so it shows in inspector and server can authenticate/identify
    if (userId) {
      opts.query = { ...(opts.query || {}), userId };
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
        console.error("[ueSocket] connect_error", err && err.message ? err.message : err);
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

    // First attempt: force websocket transport to get ws:// handshake quickly
    socketRef.current = io(connectUrl, { ...opts, transports: ["websocket"] });
    const handlers = attachHandlers(socketRef.current);

    // If websocket-first doesn't connect within 2s, fallback to default transports (polling -> upgrade)
    fallbackTimer = setTimeout(() => {
      if (!socketRef.current) return;
      const s = socketRef.current;
      if (!s.connected) {
        try {
          s.off("message:new");
          s.off("connect");
          s.off("disconnect");
          s.off("connect_error");
          if (s.offAny && handlers && handlers.tracer) s.offAny(handlers.tracer);
          s.disconnect();
        } catch (e) {}
        // create new socket without forcing transports
        socketRef.current = io(connectUrl, opts);
        attachHandlers(socketRef.current);
      }
    }, 2000);

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
      if (fallbackTimer) clearTimeout(fallbackTimer);
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
