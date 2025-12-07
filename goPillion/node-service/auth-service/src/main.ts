import express from "express";
import dotenv from "dotenv";
dotenv.config();

import sequelize from "./database_connection/db.connection";
// import authRoutes from "./routes/auth";

const app = express();
app.use(express.json());

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

// app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
