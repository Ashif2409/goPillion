import http from 'http';
import { URL } from 'url';
import { verifyTokenWithAuthService } from '../middleware/verifytoken';
import WebSocket from 'ws';

export interface AuthenticatedWS extends WebSocket {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticateSocket = async (
  req: http.IncomingMessage
) => {
  console.log('🔌 WebSocket connection attempt');

  let token: string | undefined;

  /* ---------- 1. Authorization Header ---------- */
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  /* ---------- 2. Query Param Fallback ---------- */
  if (!token && req.url) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    token = url.searchParams.get('token') || undefined;
  }

  console.log('Token:', token ? 'Present' : 'Missing');

  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }

  console.log('🔍 Verifying token...');
  const user = await verifyTokenWithAuthService(token);

  console.log('✅ Token verified:', user);

  return {
    userId: user.userId,
    role: user.role
  };
};
