import { Request, Response } from "express";
import { uploadToCloudinary } from "../services/upload.service";
import { DriverKyc } from "../schema/driverKyc.schema";

/**
 * 🛠️ Internal Helper
 */
const processDocumentUpload = async (
  driverId: string,
  file: Express.Multer.File,
  fieldName: string,
  folder: string
) => {
  const fileUrl: string = await uploadToCloudinary(file.buffer, folder);

  return DriverKyc.findOneAndUpdate(
    { driverId },
    {
      $set: {
        [fieldName]: {
          url: fileUrl,
          status: "PENDING",
          uploadedAt: new Date(),
        },
        kycStatus: "PENDING",
      },
    },
    { upsert: true, new: true }
  );
};

/**
 * 🚀 Upload Controller Factory
 */
const createUploadController = (fieldName: string, folderName: string) => {
  return async (req: Request, res: Response) => {
    try {
      const driverId = req.user?.userId;
      if (!driverId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "File is required",
        });
      }

      const updatedKyc = await processDocumentUpload(
        driverId,
        req.file,
        fieldName,
        `driver-kyc/${folderName}`
      );

      return res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        data: (updatedKyc as any)[fieldName],
      });
    } catch (error) {
      console.error(`Upload error [${fieldName}]`, error);
      return res
        .status(500)
        .json({ success: false, message: "Upload failed" });
    }
  };
};

/**
 * 📤 Upload Controllers
 */
export const identityProofUploadController =
  createUploadController("identityProof", "identity-proof");

export const driverLicenseUploadController =
  createUploadController("drivingLicense", "driving-license");

export const vehicleRcUploadController =
  createUploadController("vehicleRC", "vehicle-rc");

export const vehicleInsuranceUploadController =
  createUploadController("vehicleInsurance", "vehicle-insurance");

export const driverPhotoUploadController =
  createUploadController("driverPhoto", "driver-photo");

export const pollutionCertificateUploadController =
  createUploadController(
    "pollutionCertificate",
    "pollution-certificate"
  );

/**
 * 📄 Fetch Controller Factory
 */
const createGetDocController = (fieldName: string) => {
  return async (req: Request, res: Response) => {
    try {
      const driverId = req.user?.userId;
      if (!driverId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const kyc = await DriverKyc.findOne(
        { driverId },
        { [fieldName]: 1, _id: 0 }
      );

      if (!kyc || !(kyc as any)[fieldName]) {
        return res
          .status(404)
          .json({ success: false, message: "Document not found" });
      }

      return res.status(200).json({
        success: true,
        data: (kyc as any)[fieldName],
      });
    } catch {
      return res
        .status(500)
        .json({ success: false, message: "Fetch failed" });
    }
  };
};

/**
 * 📥 Fetch Controllers
 */
export const getIdentityProofController =
  createGetDocController("identityProof");

export const getDrivingLicenseController =
  createGetDocController("drivingLicense");

export const getVehicleRcController =
  createGetDocController("vehicleRC");

export const getVehicleInsuranceController =
  createGetDocController("vehicleInsurance");

export const getDriverPhotoController =
  createGetDocController("driverPhoto");

export const getPollutionCertificateController =
  createGetDocController("pollutionCertificate");



/**
 * 📊 KYC Status
 */
export const kycStatusController = async (req: Request, res: Response) => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const kyc = await DriverKyc.findOne(
      { driverId },
      { kycStatus: 1, _id: 0 }
    );

    return res.status(200).json({
      success: true,
      kycStatus: kyc?.kycStatus || "INCOMPLETE",
    });
  } catch {
    return res
      .status(500)
      .json({ success: false, message: "Status fetch failed" });
  }
};
