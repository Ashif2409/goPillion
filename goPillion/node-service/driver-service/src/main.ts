import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';

// Only load .env in non-production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({
    path: path.resolve(__dirname, '../../.env')
  });
}

import { driverRoutes } from './routes/driver.route';
import { connectDB } from './database/dbconnection';
import { adminRoutes } from './routes/admin.route';

const host = process.env.HOST ?? '0.0.0.0';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api/driver/kyc', driverRoutes);
app.use('/api/admin/kyc', adminRoutes);
// Start server only after DB connection
const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, host, () => {
      console.log(`✅ Driver service ready at http://${host}:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();