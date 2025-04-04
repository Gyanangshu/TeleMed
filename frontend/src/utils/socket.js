import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000,
  transports: ['websocket', 'polling']
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  if (reason === 'io server disconnect') {
    // The server has forcefully disconnected the socket
    socket.connect();
  }
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Reconnection attempt:', attemptNumber);
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
});

export const connectSocket = (token) => {
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  socket.disconnect();
};

export default socket; 