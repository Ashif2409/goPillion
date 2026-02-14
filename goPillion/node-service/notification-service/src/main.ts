import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';

dotenv.config();

import { connectToMongoDB } from './db/mongoDB.connection';
import { notificationRoute } from './routes/notification.route';
import { initializeWebSocketServer } from './websocket/socket.server';
import testRouter from './routes/test.route';
import { setupSwagger } from './swagger/swagger';

// 👇 both consumers are started from ONE function
import { startKafkaConsumers ,stopKafkaConsumers  } from './kafka/kafka.consumer';

const host = process.env.NOTIFICATION_HOST ?? '0.0.0.0';
const port = process.env.NOTIFICATION_PORT
  ? Number(process.env.NOTIFICATION_PORT)
  : 3000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

setupSwagger(app);
app.use('/api/notifications', notificationRoute);
app.use('/api', testRouter);

app.get('/', (_req, res) => {
  res.send({ message: 'Notification Service is running' });
});

const startServer = async () => {
  try {
    await connectToMongoDB();

    const server = http.createServer(app);
    initializeWebSocketServer(server);

    // 🔥 Start ALL Kafka consumers here
    await startKafkaConsumers();

    server.listen(port, host, () => {
      console.log(`[ready] Notification Service running at http://${host}:${port}`);
    });
  } catch (err) {
    console.error('❌ Failed to start Notification Service', err);
    process.exit(1);
  }
};

startServer();

// 🧹 Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔻 Shutting down Notification Service...');
  await stopKafkaConsumers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔻 Shutting down Notification Service...');
  await stopKafkaConsumers();
  process.exit(0);
});
