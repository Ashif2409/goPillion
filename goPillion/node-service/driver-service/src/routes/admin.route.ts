import express, { Request, Response } from 'express';
import { adminMiddleware } from '../middleware/admin.middleware';
import {
    getAllKycPending,
    getKycById,
    updateKycDocumentStatus,
    getKycByDriverId
} from '../controllers/admin.controller';

const router = express.Router();

// Health check / Base admin route
router.get("/", (_req: Request, res: Response) => {
    res.send({ message: "Admin Service Running" });
});

// Get all drivers with PENDING KYC status
router.get("/kyc-pending", adminMiddleware, getAllKycPending);

// Get KYC by Driver ID
router.get("/driver/:driverId", adminMiddleware, getKycByDriverId);

// Get specific driver KYC details by MongoDB _id of the DriverKyc (or driverId?)
// Controller uses `DriverKyc.findById(id)` so it expects the _id of the KYC document.
// If the frontend passes driverId, we might need `findByDriverId`.
// Looking at controller: `const { id } = req.params; const kyc = await DriverKyc.findById(id);`
// So it expects the Doc ID.
router.get("/:id", adminMiddleware, getKycById);

// Update status of a specific document
router.put("/document-status", adminMiddleware, updateKycDocumentStatus);

export const adminRoutes = router;
