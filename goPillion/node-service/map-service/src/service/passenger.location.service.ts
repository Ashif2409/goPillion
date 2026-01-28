import { redis } from "../db_connection/redis.connection";



const TTL = 60; // seconds
const GEO_KEY = "geo:passengers";

/**
 * Add passenger to GEO set (online + location)
 */
export const addPassengerLocation = async (passengerId: string, lng: number, lat: number) => {
  // Add to GEO set
  await redis.geoadd(GEO_KEY, lng, lat, passengerId);

  // Optional: track last update for heartbeat
  await redis.set(`passenger:${passengerId}:last_seen`, Date.now(), 'EX', TTL);
};

/**
 * Update passenger location (heartbeat)
 */
export const updatePassengerLocation = async (
  passengerId: string,
  lng: number,
  lat: number
) => {
  // Always update location
  await redis.geoadd(GEO_KEY, lng, lat, passengerId);

  // Refresh heartbeat AFTER update
  await redis.set(
    `passenger:${passengerId}:last_seen`,
    Date.now(),
    'EX',
    TTL
  );

  return true;
};


export const removePassengerLocation = async (passengerId: string) => {
  await redis.zrem(GEO_KEY, passengerId);
  await redis.del(`passenger:${passengerId}:last_seen`);
}
/**
 * Optional: Get a single passenger's location
 */
export const getPassengerLocation = async (passengerId: string) => {
  const coord = await redis.geopos(GEO_KEY, passengerId);
  if (!coord || !coord[0]) return null;
  const [lng, lat] = coord[0];
   return { lng, lat };
 };