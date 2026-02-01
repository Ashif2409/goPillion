import { Socket } from "socket.io";
import { verifyTokenWithAuthService } from "./verifytoken";

export const authenticateSocket = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    console.log('🔌 WebSocket connection attempt');
    console.log('Auth:', socket.handshake.auth);
    console.log('Query:', socket.handshake.query);
    
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    console.log('Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.error('❌ No token provided');
      return next(new Error("Unauthorized: No token provided"));
    }

    console.log('🔍 Verifying token...');
    const user = await verifyTokenWithAuthService(token as string);
    
    console.log('✅ Token verified:', user);

    socket.data.userId = user.userId;
    socket.data.role = user.role;

    next();
  } catch (error:any) {
    console.error('❌ Socket authentication failed:', error);
    next(new Error(`Unauthorized: ${error.message || 'Token verification failed'}`));
  }
};