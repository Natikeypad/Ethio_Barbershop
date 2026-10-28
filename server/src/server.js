import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import { Server } from 'socket.io';

import bookingsRouter from './routes/bookings.js';
import barbersRouter from './routes/barbers.js';
import servicesRouter from './routes/services.js';
import transactionsRouter from './routes/transactions.js';
import queueRouter from './routes/queue.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ethio-barbershop';

// Create Socket.IO server with cors origin from env
const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware: cors, express.json()
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Store io on app: app.set('io', io)
app.set('io', io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'ethio-barbershop-server',
  });
});

// Mount routes: /api/bookings, /api/barbers, /api/services, /api/transactions, /api/queue
app.use('/api/bookings', bookingsRouter);
app.use('/api/barbers', barbersRouter);
app.use('/api/services', servicesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/queue', queueRouter);

// 404 handler for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Socket.IO connection handler (log connections)
io.on('connection', (socket) => {
  console.log(`[Socket.IO] New client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (reason: ${reason})`);
  });
});

// Connect to MongoDB then start listening
async function startServer() {
  try {
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    httpServer.listen(PORT, () => {
      console.log(`Ethiopian Barbershop Server running on port ${PORT}`);
      console.log(`Client URL allowed: ${CLIENT_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, httpServer, io };
