// auth/verifyToken.ts
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();
export const verifyTokenWithAuthService = async (token: string) => {
  // Remove the try/catch here so the middleware can catch the specific error
  const response = await axios.post(
    `${process.env.AUTH_SERVICE_URL}/verify-token`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.user;
};
