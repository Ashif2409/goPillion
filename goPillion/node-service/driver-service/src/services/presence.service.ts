import { redis } from "../database/redisConnection";

const TTL=60;

export const goOnline = async (driverId: string) => {
    await redis.set(`driver:${driverId}:status`, 'online', 'EX', TTL);
}

export const heartbeat = async (driverId: string) => {
  const exists = await redis.expire(`driver:${driverId}:status`, TTL);
  if (exists === 0) {
    return false;
  }
  return true;
};


export const goOffline = async (driverId: string) => {
    await redis.del(`driver:${driverId}:status`);
}

export const isDriverOnline = async (driverId: string): Promise<boolean> => {
    return await redis.exists(`driver:${driverId}:status`) === 1;
}