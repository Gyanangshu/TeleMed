const jwt = require('jsonwebtoken');
const Call = require('../models/Call');

module.exports = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.userId);

    // Join call room
    socket.on('join-call', (callId) => {
      socket.join(callId);
      console.log(`User ${socket.user.userId} joined call ${callId}`);
    });

    // Leave call room
    socket.on('leave-call', (callId) => {
      socket.leave(callId);
      console.log(`User ${socket.user.userId} left call ${callId}`);
    });

    // Handle WebRTC offer
    socket.on('offer', async ({ callId, offer }) => {
      try {
        const call = await Call.findById(callId);
        if (!call || call.status !== 'pending') {
          return;
        }

        socket.to(callId).emit('offer', { offer });
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    // Handle WebRTC answer
    socket.on('answer', async ({ callId, answer }) => {
      try {
        const call = await Call.findById(callId);
        if (!call || call.status !== 'ongoing') {
          return;
        }

        socket.to(callId).emit('answer', { answer });
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', async ({ callId, candidate }) => {
      try {
        const call = await Call.findById(callId);
        if (!call || (call.status !== 'pending' && call.status !== 'ongoing')) {
          return;
        }

        socket.to(callId).emit('ice-candidate', { candidate });
      } catch (err) {
        console.error('Error handling ICE candidate:', err);
      }
    });

    // Handle new call notification
    socket.on('new-call', async ({ callId }) => {
      try {
        const call = await Call.findById(callId)
          .populate('patient')
          .populate('operator', 'name');

        if (!call) {
          return;
        }

        // Notify all doctors about the new call
        io.to('doctors').emit('new-call', { call });
      } catch (err) {
        console.error('Error handling new call notification:', err);
      }
    });

    // Join role-specific room
    if (socket.user.role === 'doctor') {
      socket.join('doctors');
    }

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.userId);
    });
  });
}; 