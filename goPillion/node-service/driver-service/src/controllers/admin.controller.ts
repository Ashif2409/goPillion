import { Request, Response } from "express";
import { DriverKyc } from "../schema/driverKyc.schema";

export const getAllKycPending = async (req: Request, res: Response) => {
    try {
        const kyc = await DriverKyc.find({ kycStatus: "PENDING" });
        return res.status(200).json({
            success: true,
            data: kyc,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch KYC pending list",
            error: error,
        });
    }
}

export const getKycById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const kyc = await DriverKyc.findById(id);
        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: kyc,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch KYC by id",
            error: error,
        });
    }
}

export const getKycByDriverId = async (req: Request, res: Response) => {
    try {
        const { driverId } = req.params;
        const kyc = await DriverKyc.findOne({ driverId });
        if (!kyc) {
            return res.status(404).json({
                success: false,
                message: "KYC not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: kyc,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch KYC by driver id",
            error: error,
        });
    }
}
const VALID_DOCS = [
    "identityProof",
    "drivingLicense",
    "vehicleRC",
    "vehicleInsurance",
    "driverPhoto",
    "pollutionCertificate",
] as const;



export const updateKycDocumentStatus = async (
    req: Request,
    res: Response
) => {
    try {
        const { driverId, documentType, status, remarks } = req.body;

        // Validate inputs
        if (!driverId) {
            return res.status(400).json({ success: false, message: "Driver ID is required" });
        }

        if (!documentType || !VALID_DOCS.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid document type. Must be one of: ${VALID_DOCS.join(", ")}`,
            });
        }

        if (!["VERIFIED", "REJECTED"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be VERIFIED or REJECTED",
            });
        }

        const driverKyc = await DriverKyc.findOne({ driverId });

        if (!driverKyc) {
            return res.status(404).json({
                success: false,
                message: "Driver KYC record not found",
            });
        }

        // Safe access using 'any' cast or explicit typing if available, 
        // but schema might not have index signature.
        // We check if the doc exists on the object.
        const doc = (driverKyc as any)[documentType];

        if (!doc) {
            return res.status(404).json({
                success: false,
                message: `Document ${documentType} not found for this driver`,
            });
        }

        // Update document status
        (driverKyc as any)[documentType].status = status;
        (driverKyc as any)[documentType].verifiedAt = new Date();
        if (remarks) {
            (driverKyc as any)[documentType].remarks = remarks;
        }

        // 🔁 Recalculate overall KYC status
        const docs = VALID_DOCS
            .map((docName) => (driverKyc as any)[docName])
            .filter((d) => d && d.url); // specific check if document exists

        // If ANY document is rejected, the whole KYC is REJECTED (or PENDING_REJECTION? usually REJECTED)
        // If ALL required documents are VERIFIED, then VERIFIED.
        // Otherwise PENDING (or INCOMPLETE if some are missing, but here we assume we are just updating status)

        // Logic:
        // 1. If any doc is REJECTED -> KYC REJECTED
        // 2. If all docs are VERIFIED -> KYC VERIFIED
        // 3. Else -> KYC PENDING

        if (docs.some((d) => d.status === "REJECTED")) {
            driverKyc.kycStatus = "REJECTED";
        } else if (docs.every((d) => d.status === "VERIFIED")) {
            // Warning: This implies all 6 docs MUST be present and verified.
            // If some docs are optional, this logic might be too strict.
            // Assuming all VALID_DOCS are required for full KYC verification.
            // We generally check if we have ALL docs.
            const allPresent = VALID_DOCS.every(docName => (driverKyc as any)[docName]?.url);
            if (allPresent) {
                driverKyc.kycStatus = "VERIFIED";
            } else {
                driverKyc.kycStatus = "PENDING";
            }
        } else {
            driverKyc.kycStatus = "PENDING";
        }

        await driverKyc.save();

        return res.status(200).json({
            success: true,
            message: "KYC document status updated",
            kycStatus: driverKyc.kycStatus,
            updatedDocument: (driverKyc as any)[documentType]
        });
    } catch (error) {
        console.error("Update KYC Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error
        });
    }
};