import express from 'express';
import { createServer } from 'http';
import { config } from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import routes from './routes';
import AuctionManager from './managers/AuctionManager';
import { Server as SocketServer } from 'socket.io';

// Load environment variables
config();

const app = express();
const httpServer = createServer(app);

// Initialize socket.io
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Basic Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Initialize socket.io auction manager
const auctionManager = new AuctionManager(httpServer);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sports-auction');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});