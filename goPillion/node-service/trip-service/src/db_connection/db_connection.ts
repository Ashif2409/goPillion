import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.TRIP_DB_NAME!,
    process.env.TRIP_DB_USERNAME!,
    process.env.TRIP_DB_PASSWORD!,
    {
        host: process.env.TRIP_DB_HOST,
        port: Number(process.env.TRIP_DB_PORT || 5432),
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // REQUIRED for Neon
            },
        },
    }
);

sequelize.authenticate()
    .then(() => console.log("✅ Trip DB connected (Neon)"))
    .catch((err) => console.error("❌ Unable to connect Trip DB:", err));

export default sequelize;
