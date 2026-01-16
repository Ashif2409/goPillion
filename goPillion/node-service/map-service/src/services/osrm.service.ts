import { osmAxios } from '../http/osm.axios';

export const calculateDistance = async (
  src: { lat: number; lng: number },
  dest: { lat: number; lng: number }
) => {
  const url =
    `${process.env.OSRM_BASE_URL}/route/v1/driving/` +
    `${src.lng},${src.lat};${dest.lng},${dest.lat}`;

  const { data } = await osmAxios.get(url, {
    params: { overview: false }
  });

  if (!data.routes || !data.routes.length) {
    throw new Error('No route found');
  }

  const route = data.routes[0];

  return {
    distanceKm: Number((route.distance / 1000).toFixed(2)),
    durationMin: Math.ceil(route.duration / 60)
  };
};
