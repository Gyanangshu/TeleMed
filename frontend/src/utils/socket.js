import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket?.connected) {
    console.log('Socket already connected');
    return socket;
  }

  if (socket) {
    console.log('Socket exists but not connected, cleaning up...');
    socket.disconnect();
    socket = null;
  }

  console.log('Initializing socket connection...');
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: {
      token
    },
    transports: ['websocket', 'polling']
  });

  // Remove any existing listeners to prevent duplicates
  socket.removeAllListeners();

  socket.on('connect', () => {
    console.log('Socket connected successfully');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    if (reason === 'io server disconnect' || reason === 'transport close') {
      // Server initiated disconnect or transport closed, try to reconnect
      console.log('Attempting to reconnect...');
      socket.connect();
    }
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    console.log('Attempting to reconnect:', attemptNumber);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect after all attempts');
  });

  console.log('Connecting socket...');
  socket.connect();

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('Disconnecting socket...');
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized');
    return null;
  }
  return socket;
}; 