// src/services/driverLocationService.ts

import { redis } from "../db_connection/redis.connection";

const TTL = 60; // seconds
const GEO_KEY = "geo:drivers";

/**
 * Add driver to GEO set (online + location)
 */
export const addDriverLocation = async (driverId: string, lng: number, lat: number) => {
  // Add to GEO set
  await redis.geoadd(GEO_KEY, lng, lat, driverId);

  // Optional: track last update for heartbeat
  await redis.set(`driver:${driverId}:last_seen`, Date.now(), 'EX', TTL);
};

/**
 * Update driver location (heartbeat)
 */
export const updateDriverLocation = async (driverId: string, lng: number, lat: number) => {
   // Always update location
    await redis.geoadd(GEO_KEY, lng, lat, driverId);
  
    // Refresh heartbeat AFTER update
    await redis.set(
      `driver:${driverId}:last_seen`,
      Date.now(),
      'EX',
      TTL
    );
  
    return true;
};

/**
 * Remove driver from GEO
 */
export const removeDriverLocation = async (driverId: string) => {
  await redis.zrem(GEO_KEY, driverId);
  await redis.del(`driver:${driverId}:last_seen`);
};

/**
 * Get nearby drivers within radiusKm
 */
export const getNearbyDrivers = async (
  center: { lat: number; lng: number },
  radiusKm: number
) => {
  const nearbyDrivers = await redis.georadius(
    GEO_KEY,
    center.lng,
    center.lat,
    radiusKm,
    "km",
    "WITHDIST",
    "WITHCOORD"
  ) as [string, string, [string, string]][];

  return nearbyDrivers.map(([id, distance, [lng, lat]]) => ({
    driverId: id,
    distanceKm: parseFloat(distance),
    lng: parseFloat(lng),
    lat: parseFloat(lat)
  }));
};

/**
 * Optional: Get a single driver's location
 */
export const getDriverLocation = async (driverId: string) => {
  const coord = await redis.geopos(GEO_KEY, driverId);
  if (!coord || !coord[0]) return null;
  const [lng, lat] = coord[0];
  return { lng, lat };
};
