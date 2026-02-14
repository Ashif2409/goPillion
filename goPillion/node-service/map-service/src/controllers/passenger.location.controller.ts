import { Request, Response } from "express";
import {
  getPassengerLocation,
  updatePassengerLocation,
  removePassengerLocation,
  addPassengerLocation,
} from "../service/passenger.location.service";



export const createPassengerLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { passengerId, lng, lat } = req.body;
    if (!passengerId || lng === undefined || lat === undefined) {
        return res.status(400).json({
        message: "passengerId, lng and lat are required",
        });
    }
    // Reuse addPassengerLocation from service
    await addPassengerLocation(passengerId, Number(lng), Number(lat));
    return res.status(201).json({
        message: "Passenger location added successfully",
    });
  } catch (error) {
    console.error("Error adding passenger location:", error);
    return res.status(500).json({
        message: "Failed to add passenger location",
    });
  }
};
/**
 * Get passenger current location
 */
export const getPassengerLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { passengerId } = req.body;

    if (!passengerId) {
      return res.status(400).json({
        message: "passengerId is required",
      });
    }

    const passengerLocation = await getPassengerLocation(passengerId);

    return res.status(200).json({
      location: passengerLocation,
    });
  } catch (error) {
    console.error("Error getting passenger location:", error);
    return res.status(500).json({
      message: "Failed to get passenger location",
    });
  }
};

/**
 * Update passenger location (live tracking)
 */
export const updatePassengerLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { passengerId, lng, lat } = req.body;

    if (!passengerId || lng === undefined || lat === undefined) {
      return res.status(400).json({
        message: "passengerId, lng and lat are required",
      });
    }

    const updatedLocation = await updatePassengerLocation(
      passengerId,
      Number(lng),
      Number(lat)
    );

    return res.status(200).json({
      location: updatedLocation,
    });
  } catch (error) {
    console.error("Error updating passenger location:", error);
    return res.status(500).json({
      message: "Failed to update passenger location",
    });
  }
};

/**
 * Remove passenger location (stop tracking)
 */
export const removePassengerLocationController = async (
  req: Request,
  res: Response
) => {
  try {
    const { passengerId } = req.body;

    if (!passengerId) {
      return res.status(400).json({
        message: "passengerId is required",
      });
    }

    await removePassengerLocation(passengerId);

    return res.status(200).json({
      message: "Passenger location removed successfully",
    });
  } catch (error) {
    console.error("Error removing passenger location:", error);
    return res.status(500).json({
      message: "Failed to remove passenger location",
    });
  }
};
