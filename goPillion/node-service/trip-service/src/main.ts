import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import sequelize from './db_connection/db_connection';
import { driverTripRouter } from './routes/tripdriver.route';
import { passengerTripRouter } from './routes/trippassenger.route';
import { initKafkaProducer } from './kafka/producer';

dotenv.config();

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

/* -------------------- Middlewares -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
/* -------------------- Routes -------------------- */
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api/driver/trip', driverTripRouter);
app.use('/api/passenger/trip', passengerTripRouter);

/* -------------------- Bootstrap -------------------- */
async function bootstrap() {
  try {
    // 1️⃣ Connect to Database
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully');

    // 2️⃣ Connect to Kafka
    await initKafkaProducer();
    console.log('Kafka producer connected successfully');

    // 3️⃣ Start Express Server
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Trip service ready at http://${host}:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start Trip Service:', error);
    process.exit(1); // important for containerized environments
  }
}

bootstrap();
