import express from 'express';
import dotenv from 'dotenv';
import sequelize from './db_connection/db_connection';
import cookieParser from 'cookie-parser';
import { driverTripRouter } from './routes/tripdriver.route';
import { passengerTripRouter } from './routes/trippassenger.route';
dotenv.config();
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

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


app.use('/api/driver/trip', driverTripRouter);
app.use('/api/passenger/trip', passengerTripRouter);
app.listen(port, '0.0.0.0', () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
