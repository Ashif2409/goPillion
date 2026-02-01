import WebSocket from 'ws';
import { EventTypes } from '../types/event.types';
import { addUser, getUserSocket } from './socket.store';
import { AuthenticatedWS } from './socket.auth';

interface WSMessage {
  event: string;
  data?: any;
}

export const registerSocketEvents = (ws: AuthenticatedWS) => {
  if (!ws.user) return;
  const userId = ws.user.userId;

  addUser(userId, ws);

  ws.on('message', (raw) => {
    let message: WSMessage;

    try {
      message = JSON.parse(raw.toString());
    } catch {
      ws.send(JSON.stringify({
        event: 'error',
        data: 'Invalid JSON'
      }));
      return;
    }

    console.log('📩 Event:', message.event, 'from', userId);
  });
};

/* ---------- EMITTERS ---------- */

export const emitRideRequested = (userId: string, payload: any) => {
  const ws = getUserSocket(userId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    event: EventTypes.RIDE_REQUESTED,
    data: payload
  }));
};

export const emitRideAccepted = (userId: string, payload: any) => {
  const ws = getUserSocket(userId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    event: EventTypes.RIDE_ACCEPTED,
    data: payload
  }));
};

export const emitDriverArrived = (driverId: string) => {
  const ws = getUserSocket(driverId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    event: EventTypes.DRIVER_ARRIVED,
    data: { message: 'Driver has arrived' }
  }));
};

export const emitOTP = (riderId: string, otp: string) => {
  const ws = getUserSocket(riderId);
  if (!ws || ws.readyState !== WebSocket.OPEN) return;

  ws.send(JSON.stringify({
    event: EventTypes.OTP,
    data: { otp }
  }));
};
