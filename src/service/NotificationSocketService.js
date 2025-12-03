import { io } from "socket.io-client";

// Lightweight socket.io client for notification namespace. Kept separate from
// the shared SocketService so chat and notification sockets can coexist.
class NotificationSocketService {
  constructor() {
    this.socket = null;
    this.url = null;
  }

  connect({ url, token, query } = {}) {
    if (!url) throw new Error("NotificationSocketService.connect requires a url");
    if (this.socket && this.url === url) return this.socket; // reuse existing

    let connectUrl = url;
    let pathOption;
    
    if (url.match(/^(ws|wss|http|https):\/\//)) {
      try {
        const parsed = new URL(url);
        if (parsed.protocol === "ws:") parsed.protocol = "http:";
        if (parsed.protocol === "wss:") parsed.protocol = "https:";
        connectUrl = `${parsed.protocol}//${parsed.host}`;
        pathOption = parsed.pathname + (parsed.search || "");
        pathOption = pathOption.replace(/([?&])userId=(?:undefined|null)(&|$)/g, (m, p1, p2) => (p2 ? p1 : ""));
      } catch (e) {
        connectUrl = url;
      }
    } else {
      // Relative URL in dev
      connectUrl = window.location.origin;
      pathOption = url;
    }

    this.url = url;
    const auth = token ? { token } : undefined;
    let cleanQuery;
    if (query && typeof query === 'object') {
      cleanQuery = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null));
      if (Object.keys(cleanQuery).length === 0) cleanQuery = undefined;
    }
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

    console.debug('[NotificationSocketService] Connecting to', connectUrl, 'with path', pathOption);
    this.socket = io(connectUrl, options);

    this.socket.on("connect_error", (err) => {
      console.error("[NotificationSocketService] connect_error:", {
        message: err?.message,
        type: err?.type,
        description: err?.description,
        data: err?.data
      });
    });

    this.socket.on("connect", () => {
      console.log("[NotificationSocketService] ✅ Connected! Socket ID:", this.socket.id, "Transport:", this.socket.io.engine.transport.name);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Notification socket disconnected", reason);
    });

  console.debug('NotificationSocketService.connect -> connectUrl', connectUrl, 'path', pathOption, 'options', options);
  return this.socket;
  }

  on(event, handler) {
    if (!this.socket) return console.warn("Notification socket not connected");
    this.socket.on(event, handler);
  }

  off(event, handler) {
    if (!this.socket) return;
    if (handler) this.socket.off(event, handler);
    else this.socket.removeAllListeners(event);
  }

  emit(event, data, ack) {
    if (!this.socket) return console.warn("Notification socket not connected");
    if (ack && typeof ack === "function") return this.socket.emit(event, data, ack);
    return this.socket.emit(event, data);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.url = null;
  }
}

const notificationSocket = new NotificationSocketService();
export default notificationSocket;
