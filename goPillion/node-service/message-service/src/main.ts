/**
 * Message Service – Bootstrap Server
 */

import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import messageRoutes from "./routes/message.routes";
import { connectToMongoDB } from "./db/mongodb.connection";

const app = express();
const port = Number(process.env.PORT) || 3333;

/* -------------------- Middlewares -------------------- */
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/* -------------------- Routes -------------------- */
app.get("/api", (_req, res) => {
  res.send({ message: "Welcome to message-service!" });
});

app.use("/api", messageRoutes);

/* -------------------- Bootstrap -------------------- */
const startServer = async () => {
  try {
    await connectToMongoDB();

    const server = app.listen(port, () => {
      console.log(
        `🚀 Message Service running at http://localhost:${port}/api`
      );
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err);
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ Failed to start Message Service", err);
    process.exit(1);
  }
};

startServer();

/* -------------------- Graceful Shutdown -------------------- */
process.on("SIGINT", async () => {
  console.log("🔻 Shutting down Message Service...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🔻 Shutting down Message Service...");
  process.exit(0);
});
