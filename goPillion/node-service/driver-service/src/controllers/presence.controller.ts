import { Request, Response } from "express";
import { goOffline, goOnline, isDriverOnline, heartbeat as serviceHeartbeat } from "../services/presence.service";

/**
 * Toggle driver's presence: go online if offline, go offline if online.
 */
export const toggleOnline = async (req: Request, res: Response): Promise<any> => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });

        const online = await isDriverOnline(driverId);
        if (online) {
            await goOffline(driverId);
            return res.status(200).json({ status: "OFFLINE" });
        }

        await goOnline(driverId);
        return res.status(200).json({ status: "ONLINE" });
    } catch (err) {
        console.error("Error toggling driver presence:", err);
        return res.status(500).json({ message: "Failed to toggle presence" });
    }
};

/**
 * Heartbeat endpoint to refresh driver's TTL in Redis.
 */
export const heartbeat = async (req: Request, res: Response): Promise<any> => {
    try {
        const driverId = req.user?.userId;
        if (!driverId) return res.status(401).json({ message: "Unauthorized" });

        const alive = await serviceHeartbeat(driverId);
        if (!alive) {
            return res.status(404).json({ message: "Driver is offline" });
        }
        res.sendStatus(204);

    } catch (err) {
        console.error("Heartbeat error:", err);
        return res.status(500).json({ message: "Heartbeat failed" });
    }
};