const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const socketEvents = require('./socket/events');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: ['https://telemedhealthcare.netlify.app/', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Socket.IO configuration with CORS
const io = socketIo(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 60000, // Increase ping timeout to 60 seconds
  pingInterval: 25000, // Increase ping interval to 25 seconds
  connectTimeout: 30000, // Connection timeout
  allowEIO3: true, // Allow Engine.IO 3 compatibility
  maxHttpBufferSize: 1e8, // Increase buffer size for large payloads (100MB)
  path: '/socket.io/', // Explicit path
  serveClient: false, // Don't serve client files
  cookie: false // Disable cookies
});

// Add socket.io connection logging
io.engine.on('connection_error', (err) => {
  console.error('Socket.io connection error:', err);
});

// Log when adapter creates or deletes a room
io.of('/').adapter.on('create-room', (room) => {
  console.log(`Room ${room} was created`);
});

io.of('/').adapter.on('join-room', (room, id) => {
  console.log(`Socket ${id} joined room ${room}`);
});

io.of('/').adapter.on('leave-room', (room, id) => {
  console.log(`Socket ${id} left room ${room}`);
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Initialize socket.io events
socketEvents(io);

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const callRoutes = require('./routes/calls')(io); // Pass io to the calls routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/calls', callRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 