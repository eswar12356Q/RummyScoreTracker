import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { database } from './models/database';
import { SocketHandlers } from './socket/socketHandlers';
import { roomService } from './services/roomService';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
database.initialize().catch(console.error);

// API Routes

// Get public rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await roomService.getPublicRooms();

    // Return simplified room list for public browsing
    const roomList = rooms.map(room => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      hostName: room.players.find(p => p.isHost)?.name || 'Unknown',
      status: room.status,
      createdAt: room.createdAt
    }));

    res.json({
      success: true,
      data: roomList
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get room details
app.get('/api/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await roomService.getRoom(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: room
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check if room can be joined
app.get('/api/rooms/:roomId/can-join', async (req, res) => {
  try {
    const { roomId } = req.params;
    const canJoin = await roomService.canJoinRoom(roomId);

    res.json({
      success: true,
      data: canJoin
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Housie Game Server is running',
    timestamp: new Date().toISOString()
  });
});

// Socket.io setup
const socketHandlers = new SocketHandlers(io);

io.on('connection', (socket) => {
  socketHandlers.handleConnection(socket);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🎲 Housie Game Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for connections`);
  console.log(`🔗 API available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');

  // Close database connection
  await database.close();

  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');

  // Close database connection
  await database.close();

  // Close server
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});