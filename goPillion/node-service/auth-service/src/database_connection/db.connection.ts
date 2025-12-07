import { Sequelize } from "sequelize";



const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: "postgres",
    logging: false,
  }
);

sequelize.authenticate()
  .then(() => console.log("PostgreSQL connected"))
  .catch((err) => console.error("Unable to connect:", err));
  
export default sequelize;