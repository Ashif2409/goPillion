import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

export const sendOTP = async (phone: string, otp: string) => {
  try {
    await client.messages.create({
      body: `Your MyApp verification code is ${otp}. It will expire in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone
    });
    return true;
  } catch (error) {
    console.error("Twilio send error:", error);
    throw new Error("Failed to send OTP");
  }
};
