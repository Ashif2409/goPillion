import { Schema, model } from "mongoose";

const userTokenSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        fcmToken: {
            type: String,
            required: true,
        },
        deviceType: {
            type: String,
            enum: ["android", "ios", "web"],
            default: "android",
        },
    },
    {
        timestamps: true,
    }
);

export const UserTokenModel = model("UserToken", userTokenSchema);
