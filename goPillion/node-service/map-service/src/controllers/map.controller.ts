import { Request, Response } from 'express';
import { calculateDistance } from '../services/osrm.service';
import { findNearby } from '../services/nominatim.service';

export const getDistanceController = async (req: Request, res: Response) => {
  const { srcLat,srcLng, destLat, destLng } = req.body;

  if (!srcLat || !srcLng || !destLat || !destLng) {
    return res.status(400).json({ message: 'src and dest required' });
  }

  const result = await calculateDistance({ lat: srcLat, lng: srcLng }, { lat: destLat, lng: destLng });
  return res.json(result);
};

export const getNearbyController = async (req: Request, res: Response) => {
  const { center, radiusKm } = req.body;

  if (!center || !radiusKm) {
    return res.status(400).json({ message: 'center and radius required' });
  }

  const places = await findNearby(center, radiusKm);
  return res.json(places);
};
