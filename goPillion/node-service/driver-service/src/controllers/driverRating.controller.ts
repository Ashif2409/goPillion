import { Request, Response } from "express";
import DriverRating from "../schema/driverRating.schema";

export const getDriverReviewsController = async (
    req: Request,
    res: Response
) => {
    try {
        const driverId = req.params.id;
        if (!driverId) {
            return res.status(400).json({ message: "Driver ID is required" });
        }

        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 5, 20);
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            DriverRating.find({ driverId })
                .sort({ createdAt: -1 }) // ✅ newest first
                .skip(skip)
                .limit(limit)
                .select("rating comment passengerId createdAt -_id"),

            DriverRating.countDocuments({ driverId }),
        ]);

        return res.status(200).json({
            success: true,
            meta: {
                page,
                limit,
                totalReviews: total,
                totalPages: Math.ceil(total / limit),
            },
            data: reviews,
        });
    } catch (error) {
        console.error("Get Driver Reviews Error:", error);
        return res.status(500).json({ message: "Failed to fetch reviews" });
    }
};

export const addDriverReviewController = async (
    req: Request,
    res: Response
) => {
    try {
        const passengerId = req.user?.userId;
        const { driverId, rating, comment } = req.body;

        if (!driverId || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const review = await DriverRating.create({
            driverId,
            passengerId,
            rating,
            comment,
        });

        return res.status(201).json({
            success: true,
            message: "Review added successfully",
            data: review,
        });
    } catch (error) {
        console.error("Add Driver Review Error:", error);
        return res.status(500).json({ message: "Failed to add review" });
    }
};

