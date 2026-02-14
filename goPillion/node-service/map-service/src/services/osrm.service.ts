import { osmAxios } from '../http/osm.axios';

// Ensure your ENV variable doesn't have a trailing slash
// Example: OSRM_BASE_URL=http://router.project-osrm.org
const OSRM_SERVICE = '/route/v1/driving';

export const getRouteDetails = async (
  srcLat: number,
  srcLng: number,
  destLat: number,
  destLng: number
) => {
  try {
    // 1. Format Coordinates (OSRM expects Longitude,Latitude)
    const coordinates = `${srcLng},${srcLat};${destLng},${destLat}`;

    // 2. Construct URL
    // overview=full -> Gives the Polyline
    // geometries=polyline -> Compressed string format
    // steps=false -> We don't need turn-by-turn instructions text, just the line
    const url = `${process.env.OSRM_BASE_URL}${OSRM_SERVICE}/${coordinates}`;

    const { data } = await osmAxios.get(url, {
      params: {
        overview: 'full',
        geometries: 'polyline',
        steps: 'false'
      }
    });

    if (!data.routes || !data.routes.length) {
      throw new Error('No route found');
    }

    const route = data.routes[0];

    return {
      distanceKm: Number((route.distance / 1000).toFixed(2)), // Meters -> Km
      durationMin: Math.ceil(route.duration / 60),            // Seconds -> Min
      polyline: route.geometry                                // The string string for the map
    };

  } catch (error) {
    console.error("OSRM Routing Error:", error);
    throw new Error("Failed to calculate route");
  }
};