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

/**
 * @swagger
 * /api/admin/kyc/kyc-pending:
 *   get:
 *     summary: Get all drivers with PENDING KYC status
 *     tags: [Admin KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending KYC documents
 */
router.get("/kyc-pending", adminMiddleware, getAllKycPending);

/**
 * @swagger
 * /api/admin/kyc/driver/{driverId}:
 *   get:
 *     summary: Get KYC by Driver ID
 *     tags: [Admin KYC]
 *     parameters:
 *       - in: path
 *         name: driverId
 *         required: true
 *         schema: { type: string }
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Driver KYC details
 */
router.get("/driver/:driverId", adminMiddleware, getKycByDriverId);

// Get specific driver KYC details by MongoDB _id of the DriverKyc (or driverId?)
// Controller uses `DriverKyc.findById(id)` so it expects the _id of the KYC document.
// If the frontend passes driverId, we might need `findByDriverId`.
// Looking at controller: `const { id } = req.params; const kyc = await DriverKyc.findById(id);`
// So it expects the Doc ID.
router.get("/:id", adminMiddleware, getKycById);

/**
 * @swagger
 * /api/admin/kyc/document-status:
 *   put:
 *     summary: Update status of a specific document
 *     tags: [Admin KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [driverId, documentType, status]
 *             properties:
 *               driverId: { type: string }
 *               documentType: { type: string }
 *               status: { type: string, enum: [VERIFIED, REJECTED] }
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put("/document-status", adminMiddleware, updateKycDocumentStatus);

export const adminRoutes = router;
