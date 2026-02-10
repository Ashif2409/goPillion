import axios from "axios";

const MAP_SERVICE_URL = process.env.MAP_SERVICE_URL || "http://localhost:3006/api/maps";

export interface RouteResponse {
    distanceKm: number;
    durationMin: number;
    polyline: string;
}

export const getRouteFromMapService = async (
    srcLat: number,
    srcLng: number,
    destLat: number,
    destLng: number
): Promise<RouteResponse> => {
    try {
        // CHANGED: Use axios.get with 'params'
        const { data } = await axios.get(`${MAP_SERVICE_URL}/routeDetails`, {
            params: {
                srcLat,
                srcLng,
                destLat,
                destLng
            }
        });

        return data;
    } catch (error: any) {
        console.error("Failed to connect to Map Service:", error.message);
        throw new Error("Map Service Unavailable");
    }
};