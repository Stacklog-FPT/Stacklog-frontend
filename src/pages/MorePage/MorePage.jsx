import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthProvider";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

let stompClient = null;

// export const connect = (onMessageReceived) => {
//   const socket = new SockJS("http://103.166.183.142:8080/ws/taskify/ws");
//   stompClient = new Client({
//     webSocketFactory: () => socket,
//     onConnect: () => {
//       console.log("WebSocket connected");
//       stompClient.subscribe("/topic/taskify", (message) => {
//         onMessageReceived(message.body);
//       });
//     },
//     debug: (str) => {
//       console.log(str);
//     },
//     onStompError: (frame) => {
//       console.error("Broker error: ", frame);
//     },
//   });

//   stompClient.activate();
// };

export const disconnect = () => {
  if (stompClient) stompClient.deactivate();
};
const MorePage = () => {
  const { user } = useAuth();

  useEffect(() => {
    connect("...");
  }, []);

  return <div>cc</div>;
};

export default MorePage;
