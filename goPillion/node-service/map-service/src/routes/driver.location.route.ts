import express from 'express';
import { addDriverLocationController,updateDriverLocationController,removeDriverLocationController,getNearbyDriversController } from '../controllers/driver.location.controller';
const router = express.Router();

router.post('/location',addDriverLocationController);
router.put('/location',updateDriverLocationController);
router.delete('/location',removeDriverLocationController);
router.get('/nearby',getNearbyDriversController);



export const driverLocationRouter = router;