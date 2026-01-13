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
 * 🔐 KYC Upload APIs
 */
router.put(
  "/identity-proof",
  authMiddleware,
  upload.single("file"),
  identityProofUploadController
);

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
 * 📄 KYC Fetch APIs
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

router.get(
  "/basic-profile/:id",
  getDriverBasicProfileController
)
export const driverRoutes = router;
