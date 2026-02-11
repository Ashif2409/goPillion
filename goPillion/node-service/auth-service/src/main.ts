import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();


import sequelize from "./database_connection/db.connection";
import { otpRoutes } from "./routes/otp.route";
import { profileRoutes } from "./routes/profile.route";
import { tokenRoutes } from "./routes/token.route";
import { setupSwagger } from "./swagger/swagger";
import { authLimiter } from "./middleware/rate_limiter.middleware";
const app = express();
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors());
setupSwagger(app);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("All models were synchronized successfully");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

app.use("/api/profile", profileRoutes);
app.use(authLimiter);
app.use("/api/auth", otpRoutes);
app.use("/api", tokenRoutes);

const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://localhost:${PORT}`));