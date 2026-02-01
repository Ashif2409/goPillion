// server.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';

dotenv.config();

import { connectToMongoDB } from './db/mongoDB.connection';
import { notificationRoute } from './routes/notification.route';
import { initializeWebSocketServer } from './websocket/socket.server';
import testRouter from './routes/test.route';

const host = process.env.NOTIFICATION_HOST ?? '0.0.0.0';
const port = process.env.NOTIFICATION_PORT
  ? Number(process.env.NOTIFICATION_PORT)
  : 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectToMongoDB();

// ✅ HTTP server
const server = http.createServer(app);

// ✅ WebSocket server (ws)
const wss = initializeWebSocketServer(server);
app.set('wss', wss);

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api/notifications', notificationRoute);
app.use('/api/test', testRouter);

server.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
