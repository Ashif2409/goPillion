import { DataTypes } from "sequelize";
import sequelize from "../db_connection/db_connection";

export const Trip = sequelize.define(
    "Trip",
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        /* ================= ROUTE DATA (NEW) ================= */
        distance: {
            type: DataTypes.FLOAT, // Stored in KM
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER, // Stored in Minutes
            allowNull: true,
        },
        routePolyline: {
            type: DataTypes.TEXT, // Text because polylines are long strings
            allowNull: true,
        },
        vehicleType: {
            type: DataTypes.ENUM("BIKE", "SCOOTY"),
            defaultValue: "BIKE",
            allowNull: false,
        },

        /* ================= PICKUP LOCATION ================= */
        srcLat: { type: DataTypes.DOUBLE, allowNull: false },
        srcLng: { type: DataTypes.DOUBLE, allowNull: false },
        srcName: { type: DataTypes.STRING, allowNull: false },

        /* ================= DROP LOCATION ================= */
        destLat: { type: DataTypes.DOUBLE, allowNull: false },
        destLng: { type: DataTypes.DOUBLE, allowNull: false },
        destName: { type: DataTypes.STRING, allowNull: false },

        /* ================= TIME WINDOW ================= */
        earliestStartTime: { type: DataTypes.DATE, allowNull: false },
        latestStartTime: { type: DataTypes.DATE, allowNull: false },

        /* ================= USERS ================= */
        passengerId: { type: DataTypes.UUID, allowNull: true },
        driverId: { type: DataTypes.UUID, allowNull: true },

        /* ================= PRICING ================= */
        price: { type: DataTypes.INTEGER, allowNull: true },

        /* ================= TRIP META ================= */
        tripType: { type: DataTypes.ENUM("IMMEDIATE", "SCHEDULED"), allowNull: false },
        tripMode: { type: DataTypes.ENUM("DRIVER_POSTED", "PASSENGER_POSTED"), allowNull: false },
        
        otp: { type: DataTypes.STRING, allowNull: true },
        otpExpiresAt: { type: DataTypes.DATE, allowNull: true },
        otpVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
        
        status: {
            type: DataTypes.ENUM("OPEN", "REQUESTED", "CONFIRMED", "ONGOING", "CANCELLED", "COMPLETED", "EXPIRED"),
            allowNull: false,
            defaultValue: "OPEN",
        },
    },
    {
        tableName: "trips",
        timestamps: true,
        indexes: [
            { fields: ["status"] },
            { fields: ["driverId"] },
            { fields: ["passengerId"] },
            { fields: ["srcLat", "srcLng"] },
            { fields: ["destLat", "destLng"] },
        ],
    }
);