import { io } from "socket.io-client";

// Simple SocketService for socket.io
// Usage:
// SocketService.connect({ url, token })
// SocketService.on("message:new", handler)
// SocketService.emit("message:create", data)
// SocketService.joinRoom(roomId)
// SocketService.leaveRoom(roomId)
// SocketService.disconnect()

class SocketService {
  constructor() {
    this.socket = null;
    this.url = null;
  }

  connect({ url, token, query } = {}) {
    if (!url) throw new Error("SocketService.connect requires a url");
    if (this.socket && this.url === url) return this.socket; // reuse existing

    // normalize ws:// -> http:// and wss:// -> https:// for socket.io-client
    let connectUrl = url;
    let pathOption;
    
    if (url.match(/^(ws|wss|http|https):\/\//)) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "ws:") parsed.protocol = "http:";
        if (parsed.protocol === "wss:") parsed.protocol = "https:";
        connectUrl = `${parsed.protocol}//${parsed.host}`;
        pathOption = parsed.pathname + (parsed.search || "");
        // strip any userId=undefined or other undefined/null query entries
        pathOption = pathOption.replace(/([?&])userId=(?:undefined|null)(&|$)/g, (m, p1, p2) => (p2 ? p1 : ""));
      } catch (e) {
        connectUrl = url;
      }
    } else {
      // Relative URL in dev: use current origin
      connectUrl = window.location.origin;
      pathOption = url;
    }

    this.url = url;
    // attach token via auth (preferred) and optionally via query
    const auth = token ? { token } : undefined;
    // sanitize query object: remove undefined/null values
    let cleanQuery;
    if (query && typeof query === "object") {
      cleanQuery = Object.fromEntries(
        Object.entries(query).filter(([, v]) => v !== undefined && v !== null)
      );
      if (Object.keys(cleanQuery).length === 0) cleanQuery = undefined;
    }
    // add token to query as fallback
    if (token && !cleanQuery) {
      cleanQuery = { token };
    } else if (token && cleanQuery) {
      cleanQuery.token = token;
    }

    const options = {
      auth,
      query: cleanQuery,
      path: pathOption,
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000,
      transports: ['polling', 'websocket'],
      withCredentials: true,
      transportOptions: {
        polling: {
          extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
        },
      },
    };

    console.debug('[SocketService] Connecting to', connectUrl, 'with path', pathOption, 'options', options);
    this.socket = io(connectUrl, options);

    this.socket.on("connect_error", (err) => {
      console.error("[SocketService] connect_error:", {
        message: err?.message,
        type: err?.type,
        description: err?.description,
        data: err?.data
      });
    });

    this.socket.on("connect", () => {
      console.log("[SocketService] ✅ Connected! Socket ID:", this.socket.id, "Transport:", this.socket.io.engine.transport.name);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected", reason);
    });

    return this.socket;
  }

  on(event, handler) {
    if (!this.socket) return console.warn("Socket not connected");
    this.socket.on(event, handler);
  }

  off(event, handler) {
    if (!this.socket) return;
    if (handler) this.socket.off(event, handler);
    else this.socket.removeAllListeners(event);
  }

  emit(event, data, ack) {
    if (!this.socket) return console.warn("Socket not connected");
    if (ack && typeof ack === "function")
      return this.socket.emit(event, data, ack);
    return this.socket.emit(event, data);
  }

  joinRoom(roomId, ack) {
    if (!this.socket) return console.warn("Socket not connected");
    return this.socket.emit("room:join", roomId, ack);
  }

  // Promise wrapper for joinRoom (useful with async/await)
  joinRoomAsync(roomId, timeout = 5000) {
    if (!this.socket) return Promise.reject(new Error("Socket not connected"));
    return new Promise((resolve, reject) => {
      let finished = false;
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        reject(new Error("joinRoom timeout"));
      }, timeout);

      this.socket.emit("room:join", roomId, (res) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (res && res.ok) resolve(res);
        else reject(res || new Error("joinRoom rejected"));
      });
    });
  }

  leaveRoom(roomId, ack) {
    if (!this.socket) return console.warn("Socket not connected");
    return this.socket.emit("room:leave", roomId, ack);
  }

  // Promise wrapper for leaveRoom
  leaveRoomAsync(roomId, timeout = 3000) {
    if (!this.socket) return Promise.reject(new Error("Socket not connected"));
    return new Promise((resolve, reject) => {
      let finished = false;
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        reject(new Error("leaveRoom timeout"));
      }, timeout);

      this.socket.emit("room:leave", roomId, (res) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (res && res.ok) resolve(res);
        else resolve(res || { ok: true });
      });
    });
  }

  // Emit message:create and return ack as Promise
  emitMessageCreate(payload, timeout = 5000) {
    if (!this.socket) return Promise.reject(new Error("Socket not connected"));
    return new Promise((resolve, reject) => {
      let finished = false;
      const timer = setTimeout(() => {
        if (finished) return;
        finished = true;
        reject(new Error("emitMessageCreate timeout"));
      }, timeout);

      this.socket.emit("message:create", payload, (res) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        if (res && res.ok) resolve(res);
        else reject(res || new Error("message:create rejected"));
      });
    });
  }

  // Convenience listeners for message:new
  onMessageNew(handler) {
    this.on("message:new", handler);
  }

  offMessageNew(handler) {
    this.off("message:new", handler);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.url = null;
  }
}

const socketService = new SocketService();
export default socketService;
