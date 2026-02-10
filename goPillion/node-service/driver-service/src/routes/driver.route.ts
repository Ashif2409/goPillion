import express, { Request, Response } from "express";
import { authMiddleware } from "../middleware/driver.middleware";
import { upload } from "../middleware/multer.middleware";
import {
  identityProofUploadController,
  driverLicenseUploadController,
  vehicleRcUploadController,
  vehicleInsuranceUploadController,
  driverPhotoUploadController,
  kycStatusController,
  getDriverKycStatusController,
  getIdentityProofController,
  getDrivingLicenseController,
  getVehicleRcController,
  getVehicleInsuranceController,
  getDriverPhotoController,
  pollutionCertificateUploadController,
  getPollutionCertificateController,
  updateVehicleInfoController,
  getVehicleInfoController,
  getDriverBasicProfileController,
} from "../controllers/driverKYC.controller";

const router = express.Router();

// Health check
router.get("/", (_req: Request, res: Response) => {
  res.send({ message: "Driver Service Running" });
});

/**
 * @swagger
 * /api/driver/kyc/identity-proof:
 *   put:
 *     summary: Upload identity proof
 *     tags: [Driver KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: Uploaded successfully }
 */
router.put(
  "/identity-proof",
  authMiddleware,
  upload.single("file"),
  identityProofUploadController
);

/**
 * @swagger
 * /api/driver/kyc/driving-license:
 *   put:
 *     summary: Upload driving license
 *     tags: [Driver KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *     responses:
 *       200: { description: Uploaded successfully }
 */
router.put(
  "/driving-license",
  authMiddleware,
  upload.single("file"),
  driverLicenseUploadController
);

router.put(
  "/vehicle-rc",
  authMiddleware,
  upload.single("file"),
  vehicleRcUploadController
);

router.put(
  "/vehicle-insurance",
  authMiddleware,
  upload.single("file"),
  vehicleInsuranceUploadController
);

router.put(
  "/driver-photo",
  authMiddleware,
  upload.single("file"),
  driverPhotoUploadController
);

router.put(
  "/pollution",
  authMiddleware,
  upload.single("file"),
  pollutionCertificateUploadController
);

router.put(
  "/vehicle-info",
  authMiddleware,
  updateVehicleInfoController
)

/**
 * @swagger
 * /api/driver/kyc/status:
 *   get:
 *     summary: Get driver's KYC status
 *     tags: [Driver KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status details
 */
router.get(
  "/status",
  authMiddleware,
  kycStatusController
);

router.get(
  "/status-driver/:id",
  getDriverKycStatusController
)

router.get(
  "/identity-proof",
  authMiddleware,
  getIdentityProofController
);

router.get(
  "/driving-license",
  authMiddleware,
  getDrivingLicenseController
);

router.get(
  "/vehicle-rc",
  authMiddleware,
  getVehicleRcController
);

router.get(
  "/vehicle-insurance",
  authMiddleware,
  getVehicleInsuranceController
);

router.get(
  "/driver-photo",
  authMiddleware,
  getDriverPhotoController
);

router.get(
  "/pollution",
  authMiddleware,
  getPollutionCertificateController
);

router.get(
  "/vehicle-info",
  authMiddleware,
  getVehicleInfoController
)

/**
 * @swagger
 * /api/driver/kyc/basic-profile/{id}:
 *   get:
 *     summary: Get driver's basic profile by user ID
 *     tags: [Driver KYC]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Basic profile details
 */
router.get(
  "/basic-profile/:id",
  getDriverBasicProfileController
)
export const driverRoutes = router;
