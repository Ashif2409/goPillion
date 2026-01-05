import express from "express";
import { getDriverReviewsController, addDriverReviewController } from "../controllers/driverRating.controller";
import { userAuthMiddleware } from "../middleware/user.middleware";
const router = express.Router();

router.get("/driver/:id", getDriverReviewsController)
router.post("/driver", userAuthMiddleware, addDriverReviewController);
export const ratingRoutes = router;    