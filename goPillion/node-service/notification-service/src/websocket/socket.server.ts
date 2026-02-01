import http from 'http';
import { WebSocketServer } from 'ws';
import { registerSocketEvents } from './socket.event';
import { removeUser } from './socket.store';
import { authenticateSocket, AuthenticatedWS } from './socket.auth';

export const initializeWebSocketServer = (server: http.Server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', async (ws: AuthenticatedWS, req) => {
        try {
            const user = await authenticateSocket(req);
            ws.user = user;

            console.log('✅ Client connected:', user.userId);

            registerSocketEvents(ws);

            ws.on('close', () => {
                removeUser(ws);
                if (ws.user) {
                    console.log('❌ Client disconnected:', ws.user.userId);
                }
            });

        } catch (err) {
            console.log('❌ Auth failed');
            ws.close(1008, 'Unauthorized');
        }
    });

    return wss;
};
