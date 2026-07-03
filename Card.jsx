import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  const url = import.meta.env.VITE_SOCKET_URL || window.location.origin;
  socket = io(url, { auth: { token }, transports: ['websocket', 'polling'], reconnectionAttempts: 5, reconnectionDelay: 1000 });
  socket.on('connect', () => console.log('Socket connected:', socket.id));
  socket.on('connect_error', (err) => console.warn('Socket error:', err.message));
  socket.on('disconnect', (reason) => console.log('Socket disconnected:', reason));
  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => { if (socket) { socket.disconnect(); socket = null; } };
export default { connectSocket, getSocket, disconnectSocket };
