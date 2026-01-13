import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
const sequelize = new Sequelize(
  process.env.AUTH_DB_NAME!,
  process.env.AUTH_DB_USERNAME!,
  process.env.AUTH_DB_PASSWORD!,
  {
    host: process.env.AUTH_DB_HOST,
    port: Number(process.env.AUTH_DB_PORT || 5432),
    dialect: "postgres",
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Unable to connect:", err));

export default sequelize;