import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


export const sendDriverLocationToMapService = async (driverId: string, lng: number, lat: number) => {
    try {
        await axios.post(`${process.env.MAP_SERVICE_URL}/drivers/location`, {
            driverId,
            lng,
            lat
        });
    } catch (err) {
        console.error("Error sending driver location to map service:", err);
    }
}

export const updateDriverLocationInMapService = async (driverId: string, lng: number, lat: number) => {
    try {
        await axios.put(`${process.env.MAP_SERVICE_URL}/drivers/location`, {
            driverId,
            lng,
            lat
        });
    } catch (err) {
        console.error("Error updating driver location in map service:", err);
    }
}

export const removeDriverFromMapService = async (driverId: string) => {
    try {
        await axios.delete(`${process.env.MAP_SERVICE_URL}/drivers/location`, {
            data: { driverId }
        });
    } catch (err) {
        console.error("Error removing driver from map service:", err);
    }
}