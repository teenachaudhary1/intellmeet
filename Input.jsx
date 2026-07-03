import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export function useSocket() {
  const { token } = useAuth();
  const socketRef = useRef(null);
  useEffect(() => {
    if (!token) return;
    socketRef.current = connectSocket(token);
    return () => disconnectSocket();
  }, [token]);
  return socketRef.current;
}

export function useMeetingSocket(meetingId, handlers = {}) {
  const { token } = useAuth();
  useEffect(() => {
    if (!token || !meetingId) return;
    const socket = connectSocket(token);
    socket.emit('join_meeting', { meetingId });
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      socket.emit('leave_meeting', { meetingId });
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };
  }, [token, meetingId]);
}
