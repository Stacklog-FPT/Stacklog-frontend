import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export default function useSocketChat(serverUrl, groupId, onMessage, onHistory) {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(serverUrl);

    socketRef.current.emit('joinGroup', groupId);

    socketRef.current.on('receiveMessage', (msg) => {
      onMessage && onMessage(msg);
    });

    socketRef.current.on('history', (msgs) => {
      onHistory && onHistory(msgs);
    });

    return () => {
      socketRef.current.emit('leaveGroup', groupId);
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [serverUrl, groupId]);

  const sendMessage = (msg) => {
    socketRef.current.emit('sendMessage', msg);
  };

  return { sendMessage };
}
