import express from "express";
import {getDistanceController , getNearbyController} from '../controllers/map.controller'

const router = express.Router();



router.post("/distance",getDistanceController);
router.post("/nearby",getNearbyController);


export const mapRoutes = router;