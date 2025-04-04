const jwt = require('jsonwebtoken');
const Call = require('../models/Call');

module.exports = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      console.log('No token provided in handshake');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      console.log('User authenticated:', decoded.userId);
      next();
    } catch (err) {
      console.error('Token verification failed:', err);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.userId);
    let currentCallId = null;

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error for user', socket.user.userId, ':', error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.user.userId, 'Reason:', reason);
      if (currentCallId) {
        socket.to(currentCallId).emit('peer-disconnected', { userId: socket.user.userId });
      }
    });

    // Reconnection handling
    socket.on('reconnect', (attemptNumber) => {
      console.log('User reconnected:', socket.user.userId, 'Attempt:', attemptNumber);
      if (currentCallId) {
        socket.join(currentCallId);
        socket.to(currentCallId).emit('peer-reconnected', { userId: socket.user.userId });
      }
    });

    // Join call room
    socket.on('join-call', async (callId) => {
      try {
        const call = await Call.findById(callId);
        if (!call) {
          socket.emit('call-error', { message: 'Call not found' });
          return;
        }

        // Leave previous call if any
        if (currentCallId) {
          socket.leave(currentCallId);
        }

        currentCallId = callId;
        socket.join(callId);
        console.log(`User ${socket.user.userId} joined call ${callId}`);
        
        // Notify others in the room
        socket.to(callId).emit('peer-joined', {
          userId: socket.user.userId,
          role: socket.user.role
        });
      } catch (err) {
        console.error('Error joining call room:', err);
        socket.emit('call-error', { message: 'Failed to join call' });
      }
    });

    // Leave call room
    socket.on('leave-call', (callId) => {
      try {
        socket.leave(callId);
        if (currentCallId === callId) {
          currentCallId = null;
        }
        console.log(`User ${socket.user.userId} left call ${callId}`);
        socket.to(callId).emit('peer-left', { userId: socket.user.userId });
      } catch (err) {
        console.error('Error leaving call room:', err);
      }
    });

    // Handle WebRTC offer
    socket.on('offer', async ({ callId, offer }) => {
      try {
        console.log('Received offer from', socket.user.userId, 'for call:', callId);
        const call = await Call.findById(callId);
        if (!call) {
          socket.emit('call-error', { message: 'Call not found' });
          return;
        }

        socket.to(callId).emit('offer', {
          offer,
          from: socket.user.userId
        });
        console.log('Offer forwarded to call room');
      } catch (err) {
        console.error('Error handling offer:', err);
        socket.emit('call-error', { message: 'Failed to process offer' });
      }
    });

    // Handle WebRTC answer
    socket.on('answer', async ({ callId, answer }) => {
      try {
        console.log('Received answer from', socket.user.userId, 'for call:', callId);
        const call = await Call.findById(callId);
        if (!call) {
          socket.emit('call-error', { message: 'Call not found' });
          return;
        }

        socket.to(callId).emit('answer', {
          answer,
          from: socket.user.userId
        });
        console.log('Answer forwarded to call room');
      } catch (err) {
        console.error('Error handling answer:', err);
        socket.emit('call-error', { message: 'Failed to process answer' });
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', async ({ callId, candidate }) => {
      try {
        if (!currentCallId || currentCallId !== callId) {
          console.log('User not in call room:', callId);
          return;
        }

        socket.to(callId).emit('ice-candidate', {
          candidate,
          from: socket.user.userId
        });
        console.log('ICE candidate forwarded from', socket.user.userId);
      } catch (err) {
        console.error('Error handling ICE candidate:', err);
      }
    });

    // Handle negotiation needed
    socket.on('negotiation-needed', ({ callId }) => {
      socket.to(callId).emit('negotiation-needed', {
        from: socket.user.userId
      });
    });

    // Join role-specific room
    if (socket.user.role === 'doctor') {
      socket.join('doctors');
      console.log(`Doctor ${socket.user.userId} joined doctors room`);
    }
  });
}; 