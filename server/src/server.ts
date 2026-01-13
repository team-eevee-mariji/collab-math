import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupGameController } from './controllers.js';
const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  setupGameController(io, socket);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`collab-math server running on http:localhost:${PORT}`);
});
