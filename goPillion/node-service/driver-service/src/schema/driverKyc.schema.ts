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
    driverId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    identityProof: { type: DocumentSchema },
    drivingLicense: { type: DocumentSchema },
    vehicleRC: { type: DocumentSchema },
    vehicleInsurance: { type: DocumentSchema },
    driverPhoto: { type: DocumentSchema },

    // ✅ NEW
    pollutionCertificate: {
      type: DocumentSchema,
    },

    kycStatus: {
      type: String,
      enum: ["INCOMPLETE", "PENDING", "VERIFIED", "REJECTED"],
      default: "INCOMPLETE",
    },
  },
  { timestamps: true }
);


export const DriverKyc = model("DriverKyc", DriverKycSchema);
