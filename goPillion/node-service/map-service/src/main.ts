import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { mapRoutes } from './routes/map.routes';
import { driverLocationRouter } from './routes/driver.location.route';
import { passengerRoutes } from './routes/passenger.location.route';
import { setupSwagger } from './swagger/swagger';

const host = process.env.MAP_HOST ?? 'localhost';
const port = process.env.MAP_PORT ? Number(process.env.MAP_PORT) : 3000;

const app = express();
app.use(express.json());
app.use(cors());
setupSwagger(app);
// Routes
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});
app.use('/api/maps', mapRoutes);
app.use('/api/driver', driverLocationRouter);
app.use('/api/passenger/location', passengerRoutes);
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
