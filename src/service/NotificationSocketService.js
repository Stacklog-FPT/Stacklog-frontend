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

    this.url = url;
    const auth = token ? { token } : undefined;

    const options = {
      auth,
      query: query && typeof query === 'object' ? Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== null)) : undefined,
      path: pathOption,
      autoConnect: true,
      reconnection: true,
    };

    this.socket = io(connectUrl, options);

    this.socket.on("connect_error", (err) => {
      try {
        console.error("Notification socket connect_error:", err && err.message ? err.message : err, "data:", err && err.data ? err.data : undefined);
      } catch (e) {
        console.error("Notification socket connect_error (unknown error)");
      }
    });

    this.socket.on("connect", () => {
      console.log("Notification socket connected", this.socket.id);
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
