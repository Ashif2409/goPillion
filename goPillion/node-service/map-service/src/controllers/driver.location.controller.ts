import { Request, Response } from "express";
import {
  addDriverLocation,
  updateDriverLocation,
  removeDriverLocation,
  getNearbyDrivers,
} from "../service/driver.location.service";

/**
 * Add driver location (mark driver online)
 */
export const addDriverLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { driverId, lng, lat } = req.body;

    if (!driverId || lng === undefined || lat === undefined) {
      return res.status(400).json({
        message: "driverId, lng and lat are required",
      });
    }

    await addDriverLocation(driverId, Number(lng), Number(lat));

    return res.status(201).json({
      message: "Driver location added successfully",
    });
  } catch (error) {
    console.error("Error adding driver location:", error);
    return res.status(500).json({
      message: "Failed to add driver location",
    });
  }
};

/**
 * Update driver location (heartbeat / movement update)
 */
export const updateDriverLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { driverId, lng, lat } = req.body;

    if (!driverId || lng === undefined || lat === undefined) {
      return res.status(400).json({
        message: "driverId, lng and lat are required",
      });
    }

    await updateDriverLocation(driverId, Number(lng), Number(lat));

    return res.status(200).json({
      message: "Driver location updated successfully",
    });
  } catch (error) {
    console.error("Error updating driver location:", error);
    return res.status(500).json({
      message: "Failed to update driver location",
    });
  }
};

/**
 * Remove driver location (mark driver offline)
 */
export const removeDriverLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { driverId } = req.body;

    if (!driverId) {
      return res.status(400).json({
        message: "driverId is required",
      });
    }

    await removeDriverLocation(driverId);

    return res.status(200).json({
      message: "Driver location removed successfully",
    });
  } catch (error) {
    console.error("Error removing driver location:", error);
    return res.status(500).json({
      message: "Failed to remove driver location",
    });
  }
};

/**
 * Get nearby online drivers using Redis GEO
 */
export const getNearbyDriversController = async (
  req: Request,
  res: Response
) => {
  try {
    const { lng, lat, radiusKm } = req.body;
    console.log(lng, lat, radiusKm);
    if (!lng || !lat || !radiusKm) {
      return res.status(400).json({
        message: "lng, lat and radiusKm are required",
      });
    }

    const center = {
      lng: Number(lng),
      lat: Number(lat),
    };

    const radius = Number(radiusKm);

    if (
      Number.isNaN(center.lng) ||
      Number.isNaN(center.lat) ||
      Number.isNaN(radius)
    ) {
      return res.status(400).json({
        message: "lng, lat and radiusKm must be valid numbers",
      });
    }

    const nearbyDrivers = await getNearbyDrivers(center, radius);

    return res.status(200).json({
      count: nearbyDrivers.length,
      drivers: nearbyDrivers,
    });
  } catch (error) {
    console.error("Error fetching nearby drivers:", error);
    return res.status(500).json({
      message: "Failed to fetch nearby drivers",
    });
  }
};
