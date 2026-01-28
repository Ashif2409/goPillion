import { redis } from "../database/redisConnection";
import { sendDriverLocationToMapService, updateDriverLocationInMapService, removeDriverFromMapService } from "../client/map.client";
const TTL=60;

export const goOnline = async (driverId: string, lng: number, lat: number) => {
    await redis.set(`driver:${driverId}:status`, 'online', 'EX', TTL);
    await sendDriverLocationToMapService(driverId, lng, lat);
}

export const heartbeat = async (driverId: string, lng: number, lat: number) => {
  const exists = await redis.expire(`driver:${driverId}:status`, TTL);
  if (exists === 0) {
    return false;
  }
  await updateDriverLocationInMapService(driverId, lng, lat);
  return true;
};


export const goOffline = async (driverId: string) => {
    await redis.del(`driver:${driverId}:status`);
    await removeDriverFromMapService(driverId);
}

export const isDriverOnline = async (driverId: string): Promise<boolean> => {
    return await redis.exists(`driver:${driverId}:status`) === 1;
}