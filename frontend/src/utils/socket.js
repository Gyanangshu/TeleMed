import { io } from 'socket.io-client';

let socket = null;

export const SOCKET_EVENTS = {
  STATUS_CHANGE: 'socketStatusChange'
};

const emitStatusChange = (status) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SOCKET_EVENTS.STATUS_CHANGE, { detail: status }));
  }
};

export const connectSocket = (token) => {
  if (socket?.connected) {
    console.log('Socket already connected');
    emitStatusChange(true);
    return socket;
  }

  if (socket) {
    console.log('Socket exists but not connected, cleaning up...');
    socket.disconnect();
    socket = null;
  }

  console.log('Initializing socket connection...');
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  console.log('Connecting to socket URL:', socketUrl);
  
  socket = io(socketUrl, {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,       // Increased from 5
    reconnectionDelay: 2000,        // Increased from 1000
    timeout: 30000,                 // Increased from 20000
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    forceNew: true,
    // Add explicit path to ensure we connect to the right endpoint
    path: '/socket.io/'
  });

  // Remove any existing listeners to prevent duplicates
  socket.removeAllListeners();

  socket.on('connect', () => {
    console.log('Socket connected successfully with ID:', socket.id);
    console.log('Socket connected to namespace:', socket.nsp);
    emitStatusChange(true);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    console.error('Connection details:', {
      url: socketUrl,
      transport: socket.io.engine.transport.name,
      connected: socket.connected,
      id: socket.id
    });
    emitStatusChange(false);
    
    // Try to reconnect after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect after timeout...');
      // Try with polling if websocket failed
      socket.io.opts.transports = ['polling', 'websocket'];
      socket.connect();
    }, 3000);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected. Reason:', reason);
    emitStatusChange(false);
    if (reason === 'io server disconnect' || reason === 'transport close') {
      // Server initiated disconnect or transport closed, try to reconnect
      console.log('Attempting to reconnect...');
      socket.connect();
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('Reconnected after', attemptNumber, 'attempts');
    emitStatusChange(true);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Reconnection error:', error.message);
    emitStatusChange(false);
  });

  socket.on('reconnect_failed', () => {
    console.error('Failed to reconnect after all attempts');
    emitStatusChange(false);
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
    emitStatusChange(false);
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

export const isSocketConnected = () => {
  return socket?.connected || false;
}; 