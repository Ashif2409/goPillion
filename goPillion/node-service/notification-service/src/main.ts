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
const host = process.env.NOTIFICATION_HOST ?? '0.0.0.0';
const port = process.env.NOTIFICATION_PORT ? Number(process.env.NOTIFICATION_PORT) : 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
setupSwagger(app);
connectToMongoDB();

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api/notifications', notificationRoute);
app.use('/api', testRouter);
const server = http.createServer(app);
initializeWebSocketServer(server);


server.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
