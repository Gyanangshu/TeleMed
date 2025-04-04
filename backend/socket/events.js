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

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', socket.user.userId, 'Reason:', reason);
    });

    // Join call room
    socket.on('join-call', (callId) => {
      try {
        socket.join(callId);
        console.log(`User ${socket.user.userId} joined call ${callId}`);
      } catch (err) {
        console.error('Error joining call room:', err);
      }
    });

    // Leave call room
    socket.on('leave-call', (callId) => {
      try {
        socket.leave(callId);
        console.log(`User ${socket.user.userId} left call ${callId}`);
      } catch (err) {
        console.error('Error leaving call room:', err);
      }
    });

    // Handle WebRTC offer
    socket.on('offer', async ({ callId, offer }) => {
      try {
        console.log('Received offer for call:', callId);
        const call = await Call.findById(callId);
        if (!call || call.status !== 'pending') {
          console.log('Invalid call or status for offer');
          return;
        }

        socket.to(callId).emit('offer', { offer });
        console.log('Offer forwarded to call room');
      } catch (err) {
        console.error('Error handling offer:', err);
      }
    });

    // Handle WebRTC answer
    socket.on('answer', async ({ callId, answer }) => {
      try {
        console.log('Received answer for call:', callId);
        const call = await Call.findById(callId);
        if (!call || call.status !== 'ongoing') {
          console.log('Invalid call or status for answer');
          return;
        }

        socket.to(callId).emit('answer', { answer });
        console.log('Answer forwarded to call room');
      } catch (err) {
        console.error('Error handling answer:', err);
      }
    });

    // Handle ICE candidates
    socket.on('ice-candidate', async ({ callId, candidate }) => {
      try {
        console.log('Received ICE candidate for call:', callId);
        const call = await Call.findById(callId);
        if (!call || (call.status !== 'pending' && call.status !== 'ongoing')) {
          console.log('Invalid call or status for ICE candidate');
          return;
        }

        socket.to(callId).emit('ice-candidate', { candidate });
        console.log('ICE candidate forwarded to call room');
      } catch (err) {
        console.error('Error handling ICE candidate:', err);
      }
    });

    // Handle new call notification
    socket.on('new-call', async ({ callId }) => {
      try {
        console.log('New call notification for:', callId);
        const call = await Call.findById(callId)
          .populate('patient')
          .populate('operator', 'name');

        if (!call) {
          console.log('Call not found for notification');
          return;
        }

        // Notify all doctors about the new call
        io.to('doctors').emit('new-call', { call });
        console.log('New call notification sent to doctors');
      } catch (err) {
        console.error('Error handling new call notification:', err);
      }
    });

    // Join role-specific room
    if (socket.user.role === 'doctor') {
      socket.join('doctors');
      console.log(`Doctor ${socket.user.userId} joined doctors room`);
    }
  });
}; 