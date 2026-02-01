import WebSocket from 'ws';

const onlineUser = new Map<string, WebSocket>();

export const addUser = (userId: string, ws: WebSocket) => {
    console.log(`[SocketStore] Adding user ${userId}`);
    onlineUser.set(userId, ws);
    console.log(`[SocketStore] Online users count: ${onlineUser.size}`);
};

export const removeUser = (ws: WebSocket) => {
    for (const [userId, userWs] of onlineUser.entries()) {
        if (userWs === ws) {
            console.log(`[SocketStore] Removing user ${userId}`);
            onlineUser.delete(userId);
            break;
        }
    }
    console.log(`[SocketStore] Online users count: ${onlineUser.size}`);
};

export const getUserSocket = (userId: string): WebSocket | undefined => {
    return onlineUser.get(userId);
}

export const isUserOnline = (userId: string): boolean => {
    return onlineUser.has(userId);
}

export const getAllOnlineUsers = () => {
    // Return just the user IDs as WebSockets are not serializable
    return Array.from(onlineUser.keys());
};