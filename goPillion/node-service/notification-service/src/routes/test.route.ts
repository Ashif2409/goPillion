import express, { Request, Response } from 'express';
import WebSocket from 'ws';
import { getUserSocket, getAllOnlineUsers } from '../websocket/socket.store';

const testRouter = express.Router();

// In your test route file
testRouter.post('/test/ws-event', (req: Request, res: Response) => {
  const { userId, eventType, payload } = req.body;

  // Check if user is online
  const ws = getUserSocket(userId);

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    return res.status(404).json({ error: 'User not connected', userId });
  }

  // Emit the event
  ws.send(JSON.stringify({
    event: eventType,
    data: payload
  }));

  return res.json({
    success: true,
    message: `Event ${eventType} sent to user ${userId}`
  });
});

testRouter.post('/test/broadcast', (req: Request, res: Response) => {
  try {
    const { eventType, payload } = req.body;

    // Use the global io instance
    const wss = req.app.get('wss') as WebSocket.Server;

    if (!wss) {
      return res.status(500).json({ error: 'WebSocket server not initialized' });
    }

    // Broadcast to all connected clients
    let count = 0;
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          event: eventType,
          data: payload
        }));
        count++;
      }
    });

    return res.json({
      success: true,
      message: `Event ${eventType} broadcasted to all clients`,
      clientCount: count
    });

  } catch (error) {
    return res.status(500).json({ error: 'Failed to broadcast WebSocket event', details: error });
  }
});

testRouter.get('/test/online-users', (req: Request, res: Response) => {
  const users = getAllOnlineUsers();
  return res.json({
    success: true,
    count: users.length,
    users
  });
});

// Export the router
export default testRouter;