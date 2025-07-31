// import SockJS from "sockjs-client";
// import { Client } from "@stomp/stompjs";

// class WebSocketService {
//   constructor(url) {
//     this.url = url;
//     this.client = null;
//   }

//   connect(headers = {}, onConnect, onError) {
//     const socket = new SockJS(this.url);
//     this.client = new Client({
//       webSocketFactory: () => socket,
//       connectHeaders: headers,
//       debug: (str) => console.log("STOMP:", str),
//       onConnect,
//       onStompError: (frame) => {
//         console.error("STOMP Error:", frame);
//         if (onError) onError(frame);
//       },
//       onWebSocketError: (e) => {
//         console.error("WebSocket Error:", e);
//         if (onError) onError(e);
//       },
//     });

//     this.client.activate();
//   }

//   subscribe(destination, callback) {
//     if (this.client && this.client.connected) {
//       return this.client.subscribe(destination, callback);
//     } else {
//       console.warn("Cannot subscribe, STOMP client not connected");
//     }
//   }

//   send(destination, message) {
//     if (this.client && this.client.connected) {
//       this.client.send(destination, {}, JSON.stringify(message));
//     } else {
//       console.warn("Cannot send, STOMP client not connected");
//     }
//   }

//   disconnect() {
//     if (this.client) {
//       this.client.deactivate();
//       console.log("WebSocket disconnected");
//     }
//   }
// }

// const wsService = new WebSocketService(
//   "http://103.166.183.142:8080/ws/taskify"
// );

// export const connectWebSocket = (token, onMessageReceived) => {
//   wsService.connect(
//     { Authorization: `Bearer ${token}` },
//     () => {
//       console.log("✅ WebSocket connected successfully");

//       wsService.subscribe("/topic/taskservice", (message) => {
//         try {
//           const parsedMessage = JSON.parse(message.body);
//           onMessageReceived(parsedMessage);
//         } catch (error) {
//           console.error("Error parsing message:", error);
//         }
//       });
//     },
//     (error) => {
//       console.error("WebSocket connection error:", error);
//     }
//   );
// };

// export const sendWebSocketMessage = (message) => {
//   wsService.send("/app/taskify", message);
// };

// export const disconnectWebSocket = () => {
//   wsService.disconnect();
// };
