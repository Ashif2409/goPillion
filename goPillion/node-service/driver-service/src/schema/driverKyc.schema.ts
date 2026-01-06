import { Schema, model } from "mongoose";

const DocumentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
    },
    remarks: {
      type: String,
    },
  },
  { _id: false }
);

const DriverKycSchema = new Schema(
  {
    driverId: { type: String, required: true, unique: true, index: true },

    identityProof: { type: DocumentSchema },
    drivingLicense: { type: DocumentSchema },
    vehicleRC: { type: DocumentSchema },
    vehicleInsurance: { type: DocumentSchema },
    driverPhoto: { type: DocumentSchema },
    pollutionCertificate: { type: DocumentSchema },

    // ✅ Vehicle info for passengers
    vehicleName: { type: String },        // e.g., "Royal Enfield Classic 350"
    vehicleNumber: { type: String },      // e.g., "MH12AB1234"

    kycStatus: {
      type: String,
      enum: ["INCOMPLETE", "PENDING", "VERIFIED", "REJECTED"],
      default: "INCOMPLETE",
    },
  },
  { timestamps: true }
);



export const DriverKyc = model("DriverKyc", DriverKycSchema);
