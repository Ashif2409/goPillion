import { osmAxios } from '../http/osm.axios';

export const findNearby = async (
  center: { lat: number; lng: number },
  radiusKm: number
) => {
  const { data } = await osmAxios.get(
    `${process.env.NOMINATIM_BASE_URL}/reverse`,
    {
      params: {
        lat: center.lat,
        lon: center.lng,
        format: 'json'
      }
    }
  );

  return data;
};
