import { Request, Response } from 'express';
import { getRouteDetails } from '../services/osrm.service';
import { findNearby } from '../services/nominatim.service';

export const getDistanceController = async (req: Request, res: Response) => {
  const { srcLat,srcLng, destLat, destLng } = req.body;

  if (!srcLat || !srcLng || !destLat || !destLng) {
    return res.status(400).json({ message: 'src and dest required' });
  }

  const result = await getRouteDetails(Number(srcLat), Number(srcLng), Number(destLat), Number(destLng));
  return res.json(result.distanceKm);
};

export const getNearbyController = async (req: Request, res: Response) => {
  const { center, radiusKm } = req.body;

  if (!center || !radiusKm) {
    return res.status(400).json({ message: 'center and radius required' });
  }

  const places = await findNearby(center, radiusKm);
  return res.json(places);
};



export const getRouteDetailsController = async (req: Request, res: Response) => {
    try {
        // CHANGED: Use req.query instead of req.body for GET requests
        const { srcLat, srcLng, destLat, destLng } = req.query;

        if (!srcLat || !srcLng || !destLat || !destLng) {
            return res.status(400).json({ message: "Coordinates required" });
        }

        // CHANGED: Convert query strings to Numbers
        const routeData = await getRouteDetails(
            Number(srcLat),
            Number(srcLng),
            Number(destLat),
            Number(destLng)
        );

        return res.json(routeData);
    } catch (error) {
        console.error("Map Service Error:", error);
        return res.status(500).json({ message: "Failed to calculate route" });
    }
};