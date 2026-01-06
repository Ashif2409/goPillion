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




export const updateVehicleInfoController = async (req: Request, res: Response) => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { vehicleName, vehicleNumber } = req.body;

    if (!vehicleName || !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Both vehicleName and vehicleNumber are required",
      });
    }

    const updatedDriver = await DriverKyc.findOneAndUpdate(
      { driverId },
      {
        $set: {
          vehicleName,
          vehicleNumber,
        },
      },
      { new: true, upsert: true } // upsert: create if doesn't exist
    );

    return res.status(200).json({
      success: true,
      message: "Vehicle info updated successfully",
      data: {
        vehicleName: updatedDriver.vehicleName,
        vehicleNumber: updatedDriver.vehicleNumber,
      },
    });
  } catch (error) {
    console.error("Update Vehicle Info Error:", error);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};

/**
 * 📥 Get Vehicle Info Controller
 */
export const getVehicleInfoController = async (req: Request, res: Response) => {
  try {
    const driverId = req.user?.userId;
    if (!driverId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const driver = await DriverKyc.findOne(
      { driverId },
      { vehicleName: 1, vehicleNumber: 1, _id: 0 }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Vehicle info not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vehicleName: driver.vehicleName,
        vehicleNumber: driver.vehicleNumber,
      },
    });
  } catch (error) {
    console.error("Get Vehicle Info Error:", error);
    return res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

export const getDriverBasicProfileController = async (
  req: Request,
  res: Response
) => {
  try {
    const driverId = req.params.id;
    if (!driverId) {
      return res.status(400).json({ message: "Driver ID is required" });
    }

    const driver = await DriverKyc.findOne(
      { driverId },
      {
        vehicleNumber: 1,
        vehicleName: 1,
        driverPhoto: 1,
        kycStatus: 1,
        _id: 0,
      }
    );

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        vehicleNumber: driver.vehicleNumber || null,
        vehicleName: driver.vehicleName || null,
        driverPhoto: driver.driverPhoto?.url || null,
        kycStatus: driver.kycStatus,
      },
    });
  } catch (error) {
    console.error("Get Driver Basic Profile Error:", error);
    return res.status(500).json({ message: "Failed to fetch driver profile" });
  }
};