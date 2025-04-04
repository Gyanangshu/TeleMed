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
  origin: ['https://telemedicine-sheetalchaya.netlify.app', 'http://localhost:5173', 'http://localhost:3000'],
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

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Initialize socket.io events
socketEvents(io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/calls', require('./routes/calls'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 