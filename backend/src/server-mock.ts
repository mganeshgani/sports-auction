import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Mock data
const teams = [
  { _id: "1", name: "Team A", budget: 1000, players: [] },
  { _id: "2", name: "Team B", budget: 1000, players: [] }
];

const players = [
  { _id: "1", name: "Player 1", regNo: "REG001", basePrice: 100, status: "unsold" },
  { _id: "2", name: "Player 2", regNo: "REG002", basePrice: 200, status: "unsold" }
];

// Routes
app.get('/api/teams', (req, res) => {
  res.json(teams);
});

app.get('/api/players', (req, res) => {
  res.json(players);
});

// Socket.io events
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});